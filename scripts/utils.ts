import { ChildProcess, exec, ExecException, ExecOptions } from 'child_process';

export function runCommand(
  command: string,
  options: ExecOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cp: ChildProcess = exec(
      command,
      { ...options, encoding: 'utf8', shell: 'C:/Progra~1/Git/bin/bash.exe' },
      (
        error: ExecException | null,
        stdout: string | Buffer,
        stderr: string | Buffer
      ) => {
        if (error) {
          reject(stderr.toString('utf8') || error);
        } else {
          resolve(stdout.toString('utf8'));
        }
      }
    );

    cp.stderr!.on('data', (data: string): void => console.error(data));
    cp.stdout!.on('data', (data: string): void => console.log(data));
  });
}
