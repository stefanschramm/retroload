import {type SampleProvider} from './WaveDecoder.js';

export type HalfPeriodProvider = {
  /**
   * @returns List of frequency values (Hz) for all half periods
   */
  getHalfPeriods(): number[];
};

export class SampleToHalfPeriodConverter implements HalfPeriodProvider {
  private readonly sampleProvider: SampleProvider;

  constructor(sampleProvider: SampleProvider) {
    this.sampleProvider = sampleProvider;
  }

  public getHalfPeriods(): number[] {
    const samples = this.sampleProvider.getSamples();
    const offset = this.determineOffset(samples);

    const halfPeriods = [];
    let length = 1;
    let positive = samples[0] > offset;
    for (let i = 1; i < samples.length; i++) {
      const currentPositive = samples[i] > offset;
      if (positive !== currentPositive) {
        halfPeriods.push(this.sampleProvider.sampleRate / (length * 2));
        length = 0;
        positive = currentPositive;
      }
      length++;
    }

    // const histogram = getHistogram(halfPeriods);
    // console.log(histogram);

    return halfPeriods;
  }

  private determineOffset(samples: number[]): number {
    let min = 0;
    let max = 0;
    for (const s of samples) {
      if (s > max) {
        max = s;
      } else if (s < min) {
        min = s;
      }
    }
    return (max - min) / 2;
  }
}

/*
type Histogram = Record<number, number>;

function getHistogram(halfPeriods: number[]) {
  const histogram: Histogram = {};
  for (const hp of halfPeriods) {
    if (histogram[hp] === undefined) {
      histogram[hp] = 1;
    }
    else {
      histogram[hp]++;
    }
  }

  return histogram;
}
*/
