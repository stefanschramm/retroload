import {type Position} from '../common/Positioning.js';
import {DynamicSyncFinder} from './DynamicSyncFinder.js';
import {type HalfPeriodProvider} from './half_period_provider/HalfPeriodProvider.js';

describe('DynamicSyncFinder', () => {
  test('exact match at begin', () => {
    runTest(3, 0, 1, 3);
  });
  test('exact match longer than min length', () => {
    runTest(5, 0, 9, 25);
  });
  test('does not match', () => {
    runTest(7, 0, undefined, undefined);
  });
  test('does fuzzy match', () => {
    runTest(7, 0.3, 8.5714, undefined);
  });
});

function runTest(minHalfPeriods: number, maxRelativeDeviation: number, expectedResult: number | undefined, expectedPosition: number | undefined): void {
  const hpp = new DummyHalfPeriodProvider();
  const result = (new DynamicSyncFinder(hpp, minHalfPeriods, maxRelativeDeviation)).findSync();
  if (expectedPosition === undefined) {
    if (expectedResult === undefined) {
      expect(result).toBe(undefined);
    } else {
      expect(result).toBeCloseTo(expectedResult, 4);
    }
  } else {
    expect(result).toBe(expectedResult);
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
