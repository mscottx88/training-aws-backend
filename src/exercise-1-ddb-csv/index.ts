import * as AWS from 'aws-sdk';

export async function main() {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  await dynamoDB
    .put({
      Item: {
        data: 'this',
        pk: 'foo-bar',
        sk: Date.now().toString(),
      },
      TableName: 'exercise-1-ddb-csv-report-data',
    })
    .promise();
}

if (require.main === module) (async () => await main())();
