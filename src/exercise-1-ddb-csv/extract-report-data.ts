import { v1 as uuid } from 'uuid';
import * as DynamoDB from './dynamo-db';

export interface IMain {
  reportId?: string;
}

export interface IServiceConfig {
  sourceTableName: string;
  targetTableName: string;
  totalSegments: number;
}

export const TOTAL_SEGMENTS: number = 10;

export class ExtractReportData {
  public static async getConfig(options: Partial<IServiceConfig> = {}): Promise<IServiceConfig> {
    const {
      sourceTableName = DynamoDB.Tables.reportData,
      targetTableName = DynamoDB.Tables.reportTempData,
      totalSegments = TOTAL_SEGMENTS,
    }: Partial<IServiceConfig> = options;

    return {
      sourceTableName,
      targetTableName,
      totalSegments,
    };
  }

  public static async main(options: Partial<IMain> = {}): Promise<string> {
    const { reportId = uuid() }: Partial<IMain> = options;

    const extractReportData = new this(await this.getConfig());
    const { totalSegments }: IServiceConfig = extractReportData.config;

    const rows = async function* (segment: number): AsyncIterableIterator<DynamoDB.Row> {
      const selection: DynamoDB.IRows = {
        filters: { scale: [5, 10, 15, 20, 25] },
        segment,
        totalSegments,
      };

      for await (const row of extractReportData.source.rows(selection)) {
        const { pk, sk, ...rest }: DynamoDB.Row = row;

        yield {
          ...rest,
          pk: reportId,
          sk: `${pk}/${sk}`,
        };
      }
    };

    const segments: Promise<void>[] = [];
    for (let segment: number = 0; segment < totalSegments; segment++) {
      segments.push(extractReportData.target.createMany(() => rows(segment)));
    }

    await Promise.all(segments);

    return reportId;
  }

  public readonly config: IServiceConfig;
  public readonly source: DynamoDB.Service;
  public readonly target: DynamoDB.Service;

  constructor(config: IServiceConfig) {
    const { sourceTableName, targetTableName }: IServiceConfig = config;
    this.config = config;
    this.source = new DynamoDB.Service({ tableName: sourceTableName });
    this.target = new DynamoDB.Service({ tableName: targetTableName });
  }
}

export { ExtractReportData as Service };

if (require.main === module) (async () => await ExtractReportData.main())();
