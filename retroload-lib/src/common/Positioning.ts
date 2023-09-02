export type PositionProvider = {
  getCurrentPositionSample(): number;
  getCurrentPositionSecond(): number;
};

export function formatPosition(pp: PositionProvider): string {
  const timestamp = secondsToTimestamp(pp.getCurrentPositionSecond());
  const samples = pp.getCurrentPositionSample();
  return `${timestamp} sample ${samples}`;
}

function secondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600).toString(10).padStart(2, '0');
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60).toString(10).padStart(2, '0');
  const seconds = (totalSeconds % 60).toFixed(4).padStart(7, '0');

  return `${hours}:${minutes}:${seconds}`;
}
