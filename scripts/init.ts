import { posix } from 'path';
import { runCommand } from './utils';

export async function main() {
  const output: string = await runCommand('aws sts get-caller-identity');
  const { Account: accountId }: Record<string, string> = JSON.parse(output);

  const path: string = `${posix.normalize(`${__dirname}/../terraform`)}`;
  const bucket: string = `${accountId}-training-aws-backend-terraform-state`;

  await runCommand(
    `cd ${path} && terraform init -backend-config="bucket=${bucket}"`
  );
}

if (require.main === module) (async () => await main())();
