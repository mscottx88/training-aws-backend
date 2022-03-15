export type ForAwaitable<T> =
  | T[]
  | ((
      this: any,
      ...args: any[]
    ) => AsyncIterableIterator<T> | IterableIterator<T>);

export const MILLISECONDS_PER_SECOND = 1000;
export const NANOSECONDS_PER_MILLISECOND = 1e6;

export class Utils {
  public static getElapsedTimeMS(referenceTime?: [number, number]): number {
    const [seconds, nanoseconds]: number[] = process.hrtime(referenceTime);

    return (
      seconds * MILLISECONDS_PER_SECOND +
      Math.ceil(nanoseconds / NANOSECONDS_PER_MILLISECOND)
    );
  }
}
