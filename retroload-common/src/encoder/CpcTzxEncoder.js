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

  getStandardSpeedRecordOptions() {
    return {
      pilotPulseLength: 0x091a,
      syncFirstPulseLength: 0x048d,
      syncSecondPulseLength: 0x048d,
      zeroBitPulseLength: 0x048d,
      oneBitPulseLength: 0x091a,
      pilotPulses: 0x1000,
      lastByteUsedBits: 8,
      pauseLengthMs: 0x000a,
    };
  }
}
