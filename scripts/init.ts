import { posix } from 'path';
import { Utils } from '../src/utils';

export async function main() {
  const accountId: string = await Utils.getAccountId();
  const path: string = `${posix.normalize(`${__dirname}/../terraform`)}`;
  const bucket: string = `${accountId}-training-aws-backend-terraform-state`;

  await Utils.runCommand(
    `cd ${path} && terraform init -backend-config="bucket=${bucket}"`
  );
}

if (require.main === module) (async () => await main())();
