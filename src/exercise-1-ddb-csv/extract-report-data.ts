import { DynamoDB } from './dynamo-db';

export interface IServiceConfig {
  sourceTableName: string;
  tempTableName: string;
  totalSegments: number;
}

export const TOTAL_SEGMENTS: number = 10;

export class ExtractReportData {
  public static async getConfig(
    options: Partial<IServiceConfig> = {}
  ): Promise<IServiceConfig> {
    const {
      sourceTableName = 'exercise-1-ddb-csv-report-data',
      tempTableName = 'exercise-1-ddb-csv-report-temp-data',
      totalSegments = TOTAL_SEGMENTS,
    }: Partial<IServiceConfig> = options;

    return {
      sourceTableName,
      tempTableName,
      totalSegments,
    };
  }

  public static async main(): Promise<void> {
    const extractReportData = new this(await this.getConfig());
    const { totalSegments }: IServiceConfig = extractReportData.config;

    const segments: Promise<void>[] = [];
    for (let segment: number = 0; segment < totalSegments; segment++) {
      segments.push(
        extractReportData.temp.createMany(() =>
          extractReportData.source.rows({ segment, totalSegments })
        )
      );
    }

    await Promise.all(segments);
  }

  public readonly config: IServiceConfig;
  public readonly source: DynamoDB;
  public readonly temp: DynamoDB;

  constructor(config: IServiceConfig) {
    const { sourceTableName, tempTableName }: IServiceConfig = config;
    this.config = config;
    this.source = new DynamoDB({ tableName: sourceTableName });
    this.temp = new DynamoDB({ tableName: tempTableName });
  }
}

if (require.main === module) (async () => await ExtractReportData.main())();
