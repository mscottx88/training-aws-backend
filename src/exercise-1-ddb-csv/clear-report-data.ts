import { DynamoDB, Keys } from './dynamo-db';

export interface IServiceConfig {
  tableName: string;
}

export const DEFAULT_LIMIT: number = 1000;
export const MAX_BATCH_SIZE: number = 25;

export class ClearReportData {
  public static async getConfig(
    options: Partial<IServiceConfig> = {}
  ): Promise<IServiceConfig> {
    return {
      tableName: 'exercise-1-ddb-csv-report-data',
    };
  }

  public static async main(): Promise<void> {
    const instance = await this.new();
    await instance.dynamoDB.deleteMany(instance.keys.bind(instance));
  }

  public static async new(): Promise<ClearReportData> {
    return new this(await this.getConfig());
  }

  public readonly dynamoDB: DynamoDB;

  constructor(config: IServiceConfig) {
    const { tableName }: IServiceConfig = config;
    this.dynamoDB = new DynamoDB(tableName);
  }

  public async *keys(): AsyncIterableIterator<Keys> {
    for await (const { pk, sk } of this.dynamoDB.scan()) {
      yield { pk, sk };
    }
  }
}

if (require.main === module) (async () => await ClearReportData.main())();
