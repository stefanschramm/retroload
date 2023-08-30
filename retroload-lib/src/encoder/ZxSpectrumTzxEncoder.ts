import {AbstractTzxEncoder, type DataRecordOptions} from './AbstractTzxEncoder.js';

/**
 * ZX Spectrum-specific variant of the AbstractTzxEncoder
 */
export class ZxSpectrumTzxEncoder extends AbstractTzxEncoder {
  static override getTargetName() {
    return 'zxspectrum';
  }

  getTzxCycleFactor() {
    return 1;
  }

  getStandardSpeedRecordOptions(): DataRecordOptions {
    return {
      // ZX Spectrum defaults (for non-turbo-speed-data blocks)
      pauseLengthMs: 1000,
      pilotPulseLength: 2168,
      syncFirstPulseLength: 667,
      syncSecondPulseLength: 735,
      zeroBitPulseLength: 855,
      oneBitPulseLength: 1710,
      lastByteUsedBits: 8,
      pilotPulses: 8063,
    };
  }
}
