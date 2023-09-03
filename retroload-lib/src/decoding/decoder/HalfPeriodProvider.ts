import {type Position} from '../../common/Positioning.js';

export type HalfPeriodProvider = {
  /**
   * @returns Frequency value (Hz) of next half period
   */
  getNext(): number | undefined;
  /**
   * rewind cursor to previous half period
   */
  rewindOne(): void;
  getPosition(): Position;
};
