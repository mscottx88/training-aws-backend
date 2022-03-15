import { ChildProcess, exec, ExecException, ExecOptions } from 'child_process';

export type ForAwaitable<T> =
  | T[]
  | ((
      this: any,
      ...args: any[]
    ) => AsyncIterableIterator<T> | IterableIterator<T>);

export const MILLISECONDS_PER_SECOND = 1000;
export const NANOSECONDS_PER_MILLISECOND = 1e6;

export class Utils {
  public static async getAccountId(): Promise<string> {
    const output: string = await this.runCommand('aws sts get-caller-identity');
    const { Account: accountId }: Record<string, string> = JSON.parse(output);
    return accountId;
  }

  public static getElapsedTimeMS(referenceTime?: [number, number]): number {
    const [seconds, nanoseconds]: number[] = process.hrtime(referenceTime);

    return (
      seconds * MILLISECONDS_PER_SECOND +
      Math.ceil(nanoseconds / NANOSECONDS_PER_MILLISECOND)
    );
  }

  public static runCommand(
    command: string,
    options: Partial<ExecOptions> = {}
  ): Promise<string> {
    const { shell = process.env.SHELL }: Partial<ExecOptions> = options;

    return new Promise((resolve, reject) => {
      const cp: ChildProcess = exec(
        command,
        { ...options, encoding: 'utf8', shell },
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
}
