import * as DynamoDB from './dynamo-db';

export interface IServiceConfig {
  tableName: string;
}

export abstract class DynamoDbAdapter {
  public static async getConfig(options: Partial<IServiceConfig> = {}): Promise<IServiceConfig> {
    const { tableName = DynamoDB.Tables.reportData }: Partial<IServiceConfig> = options;

    return {
      tableName,
    };
  }

  public readonly config: IServiceConfig;
  public readonly dynamoDB: DynamoDB.Service;

  constructor(config: IServiceConfig) {
    const { tableName }: IServiceConfig = config;
    this.config = config;
    this.dynamoDB = new DynamoDB.Service({ tableName });
  }
}

export { DynamoDbAdapter as Service };
