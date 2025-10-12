/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import {type FrequencyRange, is, isNot} from './Frequency.js';
import {type HalfPeriodProvider} from './half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../common/logging/Logger.js';
import {formatPosition} from '../common/Positioning.js';

const debug = true;

export class SyncFinder {

  /**
   * @param fSync accepted frequency range for sync half periods
   * @param minHalfPeriods minimal number of half periods so search for
   */
  public constructor(
    private readonly halfPeriodProvider: HalfPeriodProvider,
    private readonly fSync: FrequencyRange,
    private readonly minHalfPeriods: number,
  ) {}

  /**
   * Find a valid sync sequence and leave the HalfPeriodProvider positioned at
   * the beginning of the first half period that does not belong to the sync itself.
   *
   * @returns true if a sync sequence was found
   */
  public findSync(): boolean {
    if (debug) {
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Finding sync...`);
    }
    do {
      if (!this.findSyncStart(this.fSync)) {
        return false; // end reached
      }
    } while (this.findSyncEnd(this.fSync) < this.minHalfPeriods);

    return true;
  }

  private findSyncStart(fSync: FrequencyRange): boolean {
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return false;
      }
    } while (isNot(f, fSync));

    return true;
  }

  /**
   * @returns sync length in half periods
   */
  private findSyncEnd(fSync: FrequencyRange): number {
    if (debug) {
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Finding sync end...`);
    }
    let syncLength = 0;
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return syncLength;
      }
      syncLength++;
      if (debug) {
        // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} f: ${f}...`);
      }
    } while (is(f, fSync));

    this.halfPeriodProvider.rewindOne();

    return syncLength;
  }
}
