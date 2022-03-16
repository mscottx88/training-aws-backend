import * as DynamoDB from './dynamo-db';
import * as DynamoDbAdapter from './dynamo-db-adapter';

export class ClearReportData extends DynamoDbAdapter.Service {
  public static async main(): Promise<void> {
    for (const tableName of Object.values(DynamoDB.Tables)) {
      const clearReportData = new this(await this.getConfig({ tableName }));
      await clearReportData.dynamoDB.deleteMany(() => clearReportData.dynamoDB.keys());
    }
  }
}

if (require.main === module) (async () => await ClearReportData.main())();
