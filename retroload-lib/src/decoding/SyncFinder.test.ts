import {type Position} from '../common/Positioning.js';
import {type FrequencyRange} from './Frequency.js';
import {SyncFinder} from './SyncFinder.js';
import {type HalfPeriodProvider} from './half_period_provider/HalfPeriodProvider.js';

describe('SyncFinder', () => {
  test('match longer than min length', () => {
    runTest([9, 9], 5, 25);
  });
  test('matches frequency range (inclusive) with exact min length', () => {
    runTest([3, 5], 5, 31);
  });
  test('matches at begin', () => {
    runTest([1, 1], 3, 3);
  });
  test('does not match at end', () => {
    runTest([7, 7], 3, undefined);
  });
  test('does not match', () => {
    runTest([7, 7], 6, undefined);
  });
});

function runTest(frequenceRange: FrequencyRange, minHalfPeriods: number, expectedPosition: number | undefined) {
  const hpp = new DummyHalfPeriodProvider();
  const result = (new SyncFinder(hpp, frequenceRange, minHalfPeriods)).findSync();
  if (expectedPosition === undefined) {
    expect(result).toBe(false);
  } else {
    expect(result).toBe(true);
    expect(hpp.getPosition().samples).toBe(expectedPosition);
  }
}

const halfPeriods = [
  1, 1, 1, 5, 3, 6, 1, 3, 7, 4, 9, 9, 9, 9, 5, 2, 1, 8, 6, 9, 9, 9, 9, 9, 9, 1, 5, 3, 4, 3, 3, 1, 8, 7, 7, 7,
];

class DummyHalfPeriodProvider implements HalfPeriodProvider {
  private cursor = 0;

  public getNext(): number | undefined {
    return halfPeriods[this.cursor++];
  }

  public rewindOne(): void {
    this.cursor--;
  }

  public getPosition(): Position {
    return {
      samples: this.cursor,
      seconds: this.cursor, // doesn't matter
    };
  }
}
