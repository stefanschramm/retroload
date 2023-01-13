import {BaseEncoder} from './base.js';

const fPulse = 3000;
const bitPause = 0.0013; // s

/**
 * Encoder for Sinclair ZX81
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'zx81';
  }

  recordData(dataView) {
    for (let i = 0; i < dataView.byteLength; i++) {
      this.recordByte(dataView.getUint8(i));
    }
  }

  recordByte(byte) {
    this.recordByteMSBFirst(byte);
  }

  recordBit(value) {
    if (value) {
      this.recordOscillations(fPulse, 9);
    } else {
      this.recordOscillations(fPulse, 4);
    }
    this.recordSilence(this.recorder.sampleRate * bitPause);
  }
}
