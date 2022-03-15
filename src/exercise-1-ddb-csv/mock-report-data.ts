import { v1 as uuid } from 'uuid';
import { DynamoDB, Row } from './dynamo-db';

export interface IServiceConfig {
  tableName: string;
}

export const DEFAULT_LIMIT: number = 1000;
export const MAX_BATCH_SIZE: number = 25;

export class MockReportData {
  public static async getConfig(
    options: Partial<IServiceConfig> = {}
  ): Promise<IServiceConfig> {
    return {
      tableName: 'exercise-1-ddb-csv-report-data',
    };
  }

  public static async main(): Promise<void> {
    const instance = await this.new();
    await instance.dynamoDB.createMany(instance.rows.bind(instance));
  }

  public static async new(): Promise<MockReportData> {
    return new this(await this.getConfig());
  }

  public readonly dynamoDB: DynamoDB;

  constructor(config: IServiceConfig) {
    const { tableName }: IServiceConfig = config;
    this.dynamoDB = new DynamoDB(tableName);
  }

  public *rows(limit = DEFAULT_LIMIT): IterableIterator<Row> {
    for (let index: number = 0; index < limit; index++) {
      yield {
        pk: uuid(),
        sk: 'data',
        data: {
          createdAt: new Date().toISOString(),
          foo: 'bar',
        },
      };
    }
  }
}

if (require.main === module) (async () => await MockReportData.main())();
