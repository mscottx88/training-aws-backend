import { DynamoDbAdapter } from './dynamo-db-adapter';

export class ClearReportData extends DynamoDbAdapter {
  public static async main(): Promise<void> {
    const clearReportData = new this(await this.getConfig());
    await clearReportData.dynamoDB.deleteMany(() => clearReportData.dynamoDB.keys());
  }
}

if (require.main === module) (async () => await ClearReportData.main())();
