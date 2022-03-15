import { v1 as uuid } from 'uuid';
import { Row } from './dynamo-db';
import { DynamoDbAdapter } from './dynamo-db-adapter';

export interface IServiceConfig {
  tableName: string;
}

export const DEFAULT_LIMIT: number = 1000;
export const MAX_BATCH_SIZE: number = 25;

export class MockReportData extends DynamoDbAdapter {
  public static async main(): Promise<void> {
    const instance = await this.new();
    await instance.dynamoDB.createMany(instance.mockRows.bind(instance));
  }

  public static async new(): Promise<MockReportData> {
    return new this(await this.getConfig());
  }

  public *mockRows(limit = DEFAULT_LIMIT): IterableIterator<Row> {
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
