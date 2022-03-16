import * as ChildProcess from 'child_process';

export type ForAwaitable<T> = T[] | Method<AsyncIterableIterator<T> | IterableIterator<T>>;
export type Method<R = any, A extends any[] = any[], T = any> = (this: T, ...args: A) => R;

export const MILLISECONDS_PER_SECOND = 1000;
export const NANOSECONDS_PER_MILLISECOND = 1e6;

export class Utils {
  public static async getAccountId(): Promise<string> {
    const output: string = await this.runCommand('aws sts get-caller-identity', { silent: true });
    const { Account: accountId }: Record<string, string> = JSON.parse(output);
    return accountId;
  }

  public static getElapsedTimeMS(referenceTime?: [number, number]): number {
    const [seconds, nanoseconds]: number[] = process.hrtime(referenceTime);

    return seconds * MILLISECONDS_PER_SECOND + Math.ceil(nanoseconds / NANOSECONDS_PER_MILLISECOND);
  }

  public static runCommand(
    command: string,
    { silent, ...options }: Partial<ChildProcess.ExecOptions> & { silent?: boolean } = {},
  ): Promise<string> {
    const { shell = process.env.SHELL }: Partial<ChildProcess.ExecOptions> = options;

    return new Promise((resolve, reject) => {
      const cp = ChildProcess.exec(
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

      if (!silent) {
        cp.stderr!.on('data', (data: string): void => console.error(data));
        cp.stdout!.on('data', (data: string): void => console.log(data));
      }
    });
  }
}

export { Utils as Service };
