import isMatchWith from 'lodash/isMatchWith';

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

  public static isEmptyValue(value: unknown): value is undefined | null | '' {
    return value === undefined || value === null || value === '';
  }

  public static isMatchingObject<V extends object, F extends object[]>(
    value: V,
    matchAll: boolean = true,
    ...filters: F
  ): boolean {
    let allMatching: boolean | undefined;
    let anyMatching: boolean | undefined;

    for (const filter of filters) {
      if (
        isMatchWith(value, filter, (a, b) =>
          this.isEmptyValue(a) && this.isEmptyValue(b) ? true : undefined
        )
      ) {
        anyMatching ??= true;
        allMatching ??= true;
      } else {
        allMatching = false;
      }

      if ((anyMatching && !matchAll) || (!allMatching && matchAll)) {
        break;
      }
    }

    return (matchAll ? allMatching : anyMatching) ?? filters.length === 0;
  }
}
