import { DynamoDbAdapter } from './dynamo-db-adapter';

export class ClearReportData extends DynamoDbAdapter {
  public static async main(): Promise<void> {
    for (const tableName of [
      'exercise-1-ddb-csv-report-data',
      'exercise-1-ddb-csv-report-temp-data',
    ]) {
      const clearReportData = new this(await this.getConfig({ tableName }));
      await clearReportData.dynamoDB.deleteMany(() =>
        clearReportData.dynamoDB.keys()
      );
    }
  }
}

if (require.main === module) (async () => await ClearReportData.main())();
