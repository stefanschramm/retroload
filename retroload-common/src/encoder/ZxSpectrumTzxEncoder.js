import {AbstractTzxEncoder} from './AbstractTzxEncoder.js';

/**
 * ZX Spectrum-specific variant of the AbstractTzxEncoder
 */
export class ZxSpectrumTzxEncoder extends AbstractTzxEncoder {
  static getTargetName() {
    return 'zxspectrum';
  }

  getTzxCycleFactor() {
    return 1;
  }
}
