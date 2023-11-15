export type FrequencyRange = [number, number];

export function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

export function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}

/**
 * Average 2 half periods for better precision
 */
export function avg(value1: number | undefined, value2: number | undefined): number | undefined {
  if (value1 === undefined || value2 === undefined) {
    return undefined;
  }

  return (value1 + value2) / 2;
}

export function oscillationIs(
  firstHalfValue: number | undefined,
  secondHalfValue: number | undefined,
  range: FrequencyRange,
): boolean | undefined {
  const avgValue = avg(firstHalfValue, secondHalfValue);

  return avgValue === undefined ? undefined : is(avgValue, range);
}

export function bitByFrequency(value: number | undefined, rangeZero: FrequencyRange, rangeOne: FrequencyRange): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  const isOne = is(value, rangeOne);
  const isZero = is(value, rangeZero);
  if (!isOne && !isZero) {
    return undefined;
  }

  return isOne;
}
