import { fork } from 'child_process';
import { runCommand } from './utils';

export async function main() {
  const output: string = await runCommand(
    'aws-vault exec formidable-training --no-session -- env | grep AWS_'
  );

  const variables: string[] = output.split(/\n/g);
  for (const variable of variables) {
    const [key, value] = variable.split('=');
    process.env[key] = value;
  }

  const [script, ...args]: string[] = process.argv.slice(2);

  await new Promise<void>((resolve, reject) => {
    const cp = fork(script, args);

    const onExit = (code?: number | NodeJS.Signals): boolean => cp.kill(code);
    process.once('exit', onExit);

    cp.once('exit', (code, signal) => {
      process.removeListener('exit', onExit);

      if (code || signal) {
        reject(code || signal);
      } else {
        resolve();
      }
    });
  });
}

if (require.main === module) (async () => await main())();
