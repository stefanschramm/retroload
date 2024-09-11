import {type SampleProvider} from './SampleProvider.js';

export class LowPassFilter implements SampleProvider {
  public readonly sampleRate: number;
  public readonly bitsPerSample: number;
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
  }

  public * getSamples(): Generator<number> {
    for (const s of this.sampleProvider.getSamples()) {
      this.bin.push(s);
      this.binSum += s;
      if (this.bin.length > this.maxBinSize) {
        this.binSum -= this.bin.shift() ?? 0;
      }

      yield this.binSum / this.bin.length;
    }
  }
}
