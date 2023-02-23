import {AbstractTzxEncoder} from './tzx.js';

/**
 * ZX Spectrum-specific variant of the AbstractTzxEncoder
 */
export class ZxSpectrumEncoder extends AbstractTzxEncoder {
  static getTargetName() {
    return 'zxspectrum';
  }

  getTzxCycleFactor() {
    return 1;
  }
}
