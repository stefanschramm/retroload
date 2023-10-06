export type FrequencyRange = [number, number];

export function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

export function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}
