import {type Position} from '../../common/Positioning.js';
import {type HalfPeriodProvider} from './HalfPeriodProvider.js';
import {type SampleProvider} from './SampleProvider.js';

export class StreamingSampleToHalfPeriodConverter implements HalfPeriodProvider {
  private readonly sampleRate: number;
  private readonly generator: Generator<number>;
  private generatorPosition = 0;
  private readonly offset;
  private positive: boolean;
  private previousPosition = 0;
  private previousHalfPeriod = 1; // dummy
  private rewound = false;
  private endOfInput = false;

  constructor(sampleProvider: SampleProvider) {
    this.sampleRate = sampleProvider.sampleRate;
    this.generator = sampleProvider.getSamples();
    this.offset = 1 << (sampleProvider.bitsPerSample - 1);
    this.positive = this.generator.next().value > this.offset; // consume one sample to get initial polarity
  }

  public rewindOne(): void {
    if (this.rewound) {
      throw new Error('Can only rewind once!');
    }
    this.rewound = true;
  }

  public getNext(): number | undefined {
    if (this.endOfInput) {
      return undefined;
    }
    if (this.rewound) {
      this.rewound = false;
      return this.previousHalfPeriod;
    }

    return this.getHalfPeriod();
  }

  public getPosition(): Position {
    const samples = this.rewound ? this.previousPosition : this.generatorPosition;
    return {
      samples,
      seconds: samples / this.sampleRate,
    };
  }

  private getHalfPeriod(): number | undefined {
    let length = 1;
    while (this.nextHasSamePolarity()) {
      length++;
    }
    if (this.endOfInput) {
      return undefined;
    }
    this.positive = !this.positive;
    this.previousPosition = this.generatorPosition;
    const halfPeriodFrequency = this.sampleRate / (length * 2);
    this.previousHalfPeriod = halfPeriodFrequency;

    return halfPeriodFrequency;
  }

  private nextHasSamePolarity(): boolean | undefined {
    this.generatorPosition++;
    const next = this.generator.next();
    if (next.value === undefined) {
      this.endOfInput = true;
      return false;
    }
    return this.positive === (next.value > this.offset);
  }
}
