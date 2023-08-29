export type HalfPeriodProvider = {
  /**
   * @returns Frequency value (Hz) of next half period
   */
  getNext(): number | undefined;
  /**
   * rewind cursor to previous half period
   */
  rewindOne(): void;
  getCurrentPositionSecond(): number;
  getCurrentPositionSample(): number;
};
