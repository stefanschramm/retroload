export type FrequencyRange = [number, number];

export function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

export function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}

export function oscillationIs(
  firstHalfValue: number | undefined,
  secondHalfValue: number | undefined,
  range: FrequencyRange,
): boolean | undefined {
  if (firstHalfValue === undefined || secondHalfValue === undefined) {
    return undefined;
  }

  return is((firstHalfValue + secondHalfValue) / 2, range);
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
