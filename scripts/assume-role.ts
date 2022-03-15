import { fork } from 'child_process';
import { runCommand } from './utils';

export async function main() {
  const output: string = await runCommand(
    'aws-vault exec formidable-training --no-session -- env'
  );

  const variables: string[] = output.split(/\n/g);
  for (const variable of variables) {
    const [key, value] = variable.split('=');
    if (key.startsWith('AWS_')) {
      process.env[key] = value;
    }
  }

  const [script, ...args]: string[] = process.argv.slice(2);
  fork(script, args, { detached: true });
}

if (require.main === module) (async () => await main())();
