export type Position = {
  samples: number;
  seconds: number;
};

export function formatPosition(p: Position): string {
  return `${secondsToTimestamp(p.seconds)} sample ${p.samples.toString().padStart(9, '0')}`;
}

function secondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600).toString(10).padStart(2, '0');
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60).toString(10).padStart(2, '0');
  const seconds = (totalSeconds % 60).toFixed(4).padStart(7, '0');

  return `${hours}:${minutes}:${seconds}`;
}
