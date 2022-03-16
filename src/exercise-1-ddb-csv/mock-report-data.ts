import { v1 as uuid } from 'uuid';
import type { Row } from './dynamo-db';
import { DynamoDbAdapter } from './dynamo-db-adapter';

export const DEFAULT_LIMIT: number = 1000;

export class MockReportData extends DynamoDbAdapter {
  public static async main(): Promise<void> {
    const mockReportData = new this(await this.getConfig());
    await mockReportData.dynamoDB.createMany(() => mockReportData.mockRows());
  }

  public *mockRows(limit = DEFAULT_LIMIT): IterableIterator<Row> {
    for (let index: number = 0; index < limit; index++) {
      yield {
        createdAt: new Date().toISOString(),
        foo: 'bar',
        pk: uuid(),
        scale: Math.round(Math.random() * 100),
        sk: 'data',
      };
    }
  }
}

if (require.main === module) (async () => await MockReportData.main())();
