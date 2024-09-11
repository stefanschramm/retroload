import {type SampleProvider} from './SampleProvider.js';

export class HighPassFilter implements SampleProvider {
  public readonly sampleRate: number;
  public readonly bitsPerSample: number;
  private readonly offset: number;
  private readonly maxBinSize: number;
  private readonly bin: number[] = [];
  private binSum = 0;

  public constructor(
    private readonly sampleProvider: SampleProvider,
    frequency: number,
  ) {
    this.sampleRate = sampleProvider.sampleRate;
    this.bitsPerSample = sampleProvider.bitsPerSample;
    this.maxBinSize = this.sampleRate / frequency;
    this.offset = 1 << (sampleProvider.bitsPerSample - 1);
  }

  public * getSamples(): Generator<number> {
    for (const s of this.sampleProvider.getSamples()) {
      this.bin.push(s);
      this.binSum += s;
      if (this.bin.length > this.maxBinSize) {
        this.binSum -= this.bin.shift() ?? 0;
      }
      const binAverage = this.binSum / this.bin.length;
      const filtered = s + binAverage - this.offset;

      yield filtered;
    }
  }
}
