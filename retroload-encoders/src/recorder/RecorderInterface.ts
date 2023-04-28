export type RecorderInterface = {
  pushSample: (value: SampleValue) => void;
  sampleRate: number;
};

export enum SampleValue {
  Low = -1,
  Zero = 0,
  High = 1,
}
