import { DynamoDbAdapter } from './dynamo-db-adapter';

export interface IServiceConfig {
  tableName: string;
}

export class ClearReportData extends DynamoDbAdapter {
  public static async main(): Promise<void> {
    const instance = await this.new();
    await instance.dynamoDB.deleteMany(instance.dynamoDB.keys.bind(instance));
  }

  public static async new(): Promise<ClearReportData> {
    return new this(await this.getConfig());
  }
}

if (require.main === module) (async () => await ClearReportData.main())();
