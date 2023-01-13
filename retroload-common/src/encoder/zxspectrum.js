import {TzxEncoder} from './tzx.js';

/**
 * ZX Spectrum-specific variant of the TzxEncoder
 */
export class Encoder extends TzxEncoder {
  static getTargetName() {
    return 'zxspectrum';
  }

  getTzxCycleFactor() {
    return 1;
  }
}
