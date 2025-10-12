/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import {type HalfPeriodProvider} from './half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../common/logging/Logger.js';
import {formatPosition} from '../common/Positioning.js';

const debug = true;

export class DynamicSyncFinder {

  /**
   * @param minHalfPeriods minimal number of half periods so search for
   * @param maxRelativeDeviation maximum allowed relative deviation of frequency within sync
   */
  public constructor(
    private readonly halfPeriodProvider: HalfPeriodProvider,
    private readonly minHalfPeriods: number,
    private readonly maxRelativeDeviation = 0.1,
  ) {}

  /**
   * Find a valid sync sequence of unknown frequency and leave the HalfPeriodProvider
   * positioned at the beginning of the first half period that does not belong to the
   * sync itself.
   *
   * @returns detected frequency if sync sequence was found, otherwise undefined
   */
  public findSync(): number | undefined {
    if (debug) {
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Finding sync...`);
    }

    let result;
    do {
      result = this.startMeasuring();
    } while (result === false);

    if (result !== undefined) {
      this.halfPeriodProvider.rewindOne();
    }

    if (debug) {
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Sync finding result: ${result}`);
    }

    return result;
  }

  private startMeasuring(): MeasurementResult {
    let f;
    const measuringWindow: number[] = [];
    let measuredSum = 0;
    while (undefined !== (f = this.halfPeriodProvider.getNext())) {
      if (measuringWindow.length > 0) {
        const average = measuredSum / measuringWindow.length;
        const relativeDeviation = Math.abs(1 - (f / average));
        if (relativeDeviation > this.maxRelativeDeviation) {
          if (measuringWindow.length >= this.minHalfPeriods) {
            return average; // end of sync
          }
          return false; // restart measurement
        }
      }
      measuringWindow.push(f);
      measuredSum += f;
      if (measuringWindow.length > this.minHalfPeriods) {
        // slide measuring window
        measuredSum -= measuringWindow.shift() ?? 0;
      }
    }

    return undefined; // end of data
  }
}

type MeasurementResult = number | false | undefined;
