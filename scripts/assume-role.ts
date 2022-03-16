import * as ChildProcess from 'child_process';

export async function runCommand(
  command: string,
  options: Partial<ChildProcess.ExecOptions> = {},
): Promise<string> {
  const { shell = process.env.SHELL }: Partial<ChildProcess.ExecOptions> = options;

  return new Promise((resolve, reject) => {
    ChildProcess.exec(
      command,
      { ...options, encoding: 'utf8', shell, windowsHide: true },
      (error: ChildProcess.ExecException | null, stdout: string, stderr: string): void => {
        if (error) {
          reject(stderr || error);
        } else {
          resolve(stdout);
        }
      },
    );
  });
}

export async function main() {
  const output: string = await runCommand('aws-vault exec formidable-training --no-session -- env');

  const variables: string[] = output.split(/\n/g);
  for (const variable of variables) {
    const [key, value] = variable.split('=');
    if (key.startsWith('AWS_')) {
      process.env[key] = value;
    }
  }

  const [script, ...args]: string[] = process.argv.slice(2);
  ChildProcess.fork(script, args, { detached: true });
}

if (require.main === module) (async () => await main())();
