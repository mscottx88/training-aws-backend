import { DynamoDB } from './dynamo-db';

export interface IServiceConfig {
  sourceTableName: string;
  tempTableName: string;
}

export const TOTAL_SEGMENTS: number = 10;

export class ExtractReportData {
  public static async getConfig(
    options: Partial<IServiceConfig> = {}
  ): Promise<IServiceConfig> {
    return {
      sourceTableName: 'exercise-1-ddb-csv-report-data',
      tempTableName: 'exercise-1-ddb-csv-report-temp-data',
    };
  }

  public static async main(): Promise<void> {
    const instance = await this.new();

    const segments: Promise<void>[] = [];
    for (let segment: number = 0; segment < TOTAL_SEGMENTS; segment++) {
      segments.push(
        instance.temp.createMany(() =>
          instance.source.scan({ segment, totalSegments: TOTAL_SEGMENTS })
        )
      );
    }

    await Promise.all(segments);
  }

  public static async new(): Promise<ExtractReportData> {
    return new this(await this.getConfig());
  }

  public readonly source: DynamoDB;
  public readonly temp: DynamoDB;

  constructor(config: IServiceConfig) {
    const { sourceTableName, tempTableName }: IServiceConfig = config;
    this.source = new DynamoDB(sourceTableName);
    this.temp = new DynamoDB(tempTableName);
  }
}

if (require.main === module) (async () => await ExtractReportData.main())();
