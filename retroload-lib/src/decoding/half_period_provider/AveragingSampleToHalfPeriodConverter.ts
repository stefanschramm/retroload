import {type HalfPeriodProvider} from './HalfPeriodProvider.js';
import {type Position} from '../../common/Positioning.js';
import {type SampleProvider} from '../sample_provider/SampleProvider.js';

export class AveragingSampleToHalfPeriodConverter implements HalfPeriodProvider {
  private readonly sampleProvider: SampleProvider;
  private readonly halfPeriods: number[] = [];
  private readonly halfPeriodPositions: number[] = [];
  private cursor = 0;

  public constructor(sampleProvider: SampleProvider) {
    this.sampleProvider = sampleProvider;
    this.loadHalfPeriods();
  }

  public rewindOne(): void {
    this.cursor--;
  }

  public getNext(): number | undefined {
    if (this.halfPeriods[this.cursor] === undefined) {
      return undefined;
    }

    return this.halfPeriods[this.cursor++];
  }

  public getPosition(): Position {
    const samples = (this.cursor === 0) ? 0 : this.halfPeriodPositions[this.cursor - 1];
    return {
      samples,
      seconds: samples / this.sampleProvider.sampleRate,
    };
  }

  private loadHalfPeriods(): void {
    const samples = Array.from(this.sampleProvider.getSamples());
    const offset = this.determineOffset(samples);

    let length = 1;
    let positive = samples[0] > offset;
    for (let i = 1; i < samples.length; i++) {
      const currentPositive = samples[i] > offset;
      if (positive !== currentPositive) {
        this.halfPeriods.push(this.sampleProvider.sampleRate / (length * 2));
        this.halfPeriodPositions.push(i);
        length = 0;
        positive = currentPositive;
      }
      length++;
    }

    // const histogram = getHistogram(halfPeriods);
    // console.log(histogram);
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
