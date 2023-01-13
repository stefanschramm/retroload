import {TzxEncoder} from './tzx.js';

/**
 * Amstrad CPC-specific variant of the TzxEncoder (.cdt files)
 */
export class Encoder extends TzxEncoder {
  static getTargetName() {
    return 'cpc';
  }

  getTzxCycleFactor() {
    return 40 / 35;
  }
}
