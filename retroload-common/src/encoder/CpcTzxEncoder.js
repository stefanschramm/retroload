import {AbstractTzxEncoder} from './AbstractTzxEncoder.js';

/**
 * Amstrad CPC-specific variant of the TzxEncoder (.cdt files)
 */
export class CpcTzxEncoder extends AbstractTzxEncoder {
  static getTargetName() {
    return 'cpc';
  }

  getTzxCycleFactor() {
    return 40 / 35;
  }
}
