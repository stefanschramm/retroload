export type SampleProvider = {
  readonly sampleRate: number;
  readonly bitsPerSample: number;
  getSamples(): Generator<number>;
};
