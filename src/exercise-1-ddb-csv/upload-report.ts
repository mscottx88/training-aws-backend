import * as AWS from 'aws-sdk';
import * as CSV from 'csv-stringify';
import type { Readable } from 'stream';
import { Utils } from '../utils';
import * as DynamoDB from './dynamo-db';

export interface IMain {
  reportId: string;
}

export interface IServiceConfig {
  sourceTableName: string;
  targetBucketName: string;
}

export class UploadReport {
  public static async getConfig(
    options: Partial<IServiceConfig> = {}
  ): Promise<IServiceConfig> {
    const accountId: string = await Utils.getAccountId();

    const {
      sourceTableName = 'exercise-1-ddb-csv-report-temp-data',
      targetBucketName = `${accountId}-exercise-1-ddb-csv-reports`,
    }: Partial<IServiceConfig> = options;

    return {
      sourceTableName,
      targetBucketName,
    };
  }

  public static async main(options: IMain): Promise<void> {
    const { reportId }: IMain = options;

    const now: number = Date.now();
    const csv: CSV.Stringifier = CSV.stringify({
      header: true,
      readableObjectMode: false,
      writableObjectMode: true,
    });

    const uploadReport = new this(await this.getConfig());

    const stream: Readable = uploadReport.source.createReadableStream({
      filters: { pk: reportId },
      formatRow: ({ data }: DynamoDB.Row): DynamoDB.Row | null | undefined =>
        data,
    });

    await uploadReport.s3
      .upload({
        Body: stream.pipe(csv),
        Bucket: uploadReport.config.targetBucketName,
        Key: `exercise-1-ddb-csv/${now}-${reportId}.csv`,
      })
      .promise();
  }

  public readonly config: IServiceConfig;
  public readonly source: DynamoDB.Service;
  public readonly s3: AWS.S3;

  constructor(config: IServiceConfig) {
    const { sourceTableName }: IServiceConfig = config;
    this.config = config;
    this.source = new DynamoDB.Service({ tableName: sourceTableName });
    this.s3 = new AWS.S3();
  }
}

export { UploadReport as Service };
