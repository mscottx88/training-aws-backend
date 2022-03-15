import * as AWS from 'aws-sdk';
import { Readable } from 'stream';
import { ForAwaitable, Utils } from '../utils';

export interface ICreateReadableStream {
  filters?: Record<string, any>;
  formatRow?: (row: Row) => Row | null | undefined;
}

export interface IRows {
  filters?: Record<string, any>;
  onTimeout?: (resumeAfter?: string) => void;
  resumeAfter?: string;
  segment?: number;
  timeoutMS?: number;
  totalSegments?: number;
}

export interface IServiceOptions {
  tableName: string;
}

export type IKeys = IRows;

export type Keys = Record<string, any>;
export type Row = Record<string, any>;

export const DEFAULT_LIMIT: number = 1000;
export const MAX_BATCH_SIZE: number = 25;

export class DynamoDB {
  public static buildFilterExpression(
    filters: Record<string, any> = {},
    names: Record<string, string> = {},
    values: Record<string, any> = {}
  ): string | undefined {
    const fragments: string[] = [];

    const encodeKey = (path: string[]): string =>
      path.map((key: string) => `#${key}`).join('.');

    const encodeValue = (path: string[]): string => `:${path.join('_')}`;

    const parseArray = (pointer: any[], path: string[], key: string): void => {
      const conditions: string[] = [];
      const terms: string[] = [];
      let nullValueFound: boolean = false;
      for (const [index, value] of Object.entries(pointer)) {
        if (value === undefined) {
          continue;
        }

        const encodedValue: string = encodeValue([...path, index]);
        values[encodedValue] = value;
        terms.push(encodedValue);
        nullValueFound ||= value === null;
      }

      if (terms.length > 0) {
        conditions.push(`${encodeKey(path)} IN (${terms.join(', ')})`);
      }
      if (nullValueFound) {
        conditions.push(`attribute_not_exists(${encodeKey(path)})`);
      }

      if (conditions.length > 0) {
        fragments.push(`(${conditions.join(' OR ')})`);
      }
    };

    const parseObject = (
      pointer: Record<string, any>,
      path: string[] = [],
      key: string = ''
    ): void => {
      if (key) {
        names[`#${key}`] = key;
      }

      switch (typeof pointer) {
        case 'object':
          if (Array.isArray(pointer)) {
            parseArray(pointer, path, key);
          } else if (pointer !== null) {
            for (const [subKey, value] of Object.entries(pointer)) {
              parseObject(value, [...path, subKey], subKey);
            }
          }
          break;

        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
          parseArray([pointer], path, key);
          break;
      }
    };

    parseObject(filters);

    return fragments.length > 0 ? fragments.join(' AND ') : undefined;
  }

  public static decodeResumeAfter(
    resumeAfter?: string
  ): AWS.DynamoDB.DocumentClient.Key | undefined {
    return (
      resumeAfter &&
      JSON.parse(Buffer.from(resumeAfter, 'base64').toString('utf8'))
    );
  }

  public static encodeResumeAfter(
    resumeAfter?: AWS.DynamoDB.DocumentClient.Key
  ): string | undefined {
    return (
      resumeAfter &&
      Buffer.from(JSON.stringify(resumeAfter), 'utf8').toString('base64')
    );
  }

  public readonly client: AWS.DynamoDB.DocumentClient;
  public readonly tableName: string;

  constructor(options: IServiceOptions) {
    const { tableName }: IServiceOptions = options;

    this.client = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
  }

  public async batchWrite(
    batch: AWS.DynamoDB.DocumentClient.WriteRequests
  ): Promise<void> {
    let requests: AWS.DynamoDB.DocumentClient.WriteRequests = [...batch];

    while (requests.length > 0) {
      const {
        UnprocessedItems,
      }: AWS.DynamoDB.DocumentClient.BatchWriteItemOutput = await this.client
        .batchWrite({ RequestItems: { [this.tableName]: requests } })
        .promise();

      ({ [this.tableName]: requests = [] } = UnprocessedItems || {});
    }
  }

  public async createMany(rows: ForAwaitable<Row>): Promise<void> {
    let batch: AWS.DynamoDB.DocumentClient.WriteRequests = [];

    try {
      for await (const row of Array.isArray(rows) ? rows : rows()) {
        if (batch.length + 1 > MAX_BATCH_SIZE) {
          await this.batchWrite(batch);
          batch = [];
        }
        batch.push({ PutRequest: { Item: row } });
      }
    } finally {
      await this.batchWrite(batch);
    }
  }

  public createReadableStream(
    options: Partial<ICreateReadableStream> = {}
  ): Readable {
    const { filters, formatRow }: Partial<ICreateReadableStream> = options;

    let resumeAfter: string | undefined;

    const rows = async (stream: Readable): Promise<void> => {
      for await (const row of this.rows({ filters, resumeAfter })) {
        const { pk, sk }: Row = row;

        const data: Row | null | undefined = formatRow ? formatRow(row) : row;
        if (data === undefined) {
          continue;
        }
        if (data === null) {
          break;
        }
        if (!stream.push(data)) {
          resumeAfter = DynamoDB.encodeResumeAfter({ pk, sk });
          return;
        }
      }

      stream.push(null);
    };

    return new Readable({
      objectMode: true,
      async read(this: Readable): Promise<void> {
        await rows(this);
      },
    });
  }

  public async deleteMany(keys: ForAwaitable<Keys>): Promise<void> {
    let batch: AWS.DynamoDB.DocumentClient.WriteRequests = [];

    try {
      for await (const key of Array.isArray(keys) ? keys : keys()) {
        if (batch.length + 1 > MAX_BATCH_SIZE) {
          await this.batchWrite(batch);
          batch = [];
        }
        batch.push({ DeleteRequest: { Key: key } });
      }
    } finally {
      await this.batchWrite(batch);
    }
  }

  public async *keys(
    options: Partial<IKeys> = {}
  ): AsyncIterableIterator<Keys> {
    for await (const { pk, sk } of this.rows(options)) {
      yield { pk, sk };
    }
  }

  public async *rows(options: Partial<IRows> = {}): AsyncIterableIterator<Row> {
    const START_TIME: [number, number] = process.hrtime();

    const {
      filters,
      onTimeout,
      resumeAfter,
      segment,
      timeoutMS = Infinity,
      totalSegments,
    }: Partial<IRows> = options;

    let lastEvaluatedKey: AWS.DynamoDB.DocumentClient.Key | undefined =
      DynamoDB.decodeResumeAfter(resumeAfter);
    let rows: AWS.DynamoDB.DocumentClient.ItemList | undefined;

    const names: Record<string, string> | undefined = {};
    const values: Record<string, any> | undefined = {};
    const filterExpression: string | undefined = DynamoDB.buildFilterExpression(
      filters,
      names,
      values
    );

    do {
      ({ Items: rows = [], LastEvaluatedKey: lastEvaluatedKey } =
        await this.client
          .scan({
            ExclusiveStartKey: lastEvaluatedKey,
            ExpressionAttributeNames: filterExpression ? names : undefined,
            ExpressionAttributeValues: filterExpression ? values : undefined,
            FilterExpression: filterExpression,
            Segment: segment,
            TableName: this.tableName,
            TotalSegments: totalSegments,
          })
          .promise());

      yield* rows;
    } while (
      lastEvaluatedKey &&
      Utils.getElapsedTimeMS(START_TIME) < timeoutMS
    );

    if (lastEvaluatedKey) {
      onTimeout?.(DynamoDB.encodeResumeAfter(lastEvaluatedKey));
    }
  }
}

export { DynamoDB as Service };
