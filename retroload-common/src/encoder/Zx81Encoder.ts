import {type BufferAccess} from '../BufferAccess.js';
import {AbstractEncoder} from './AbstractEncoder.js';

const fPulse = 3000;
const bitPause = 0.0013; // s

/**
 * Encoder for Sinclair ZX81
 */
export class Zx81Encoder extends AbstractEncoder {
  static getTargetName() {
    return 'zx81';
  }

  recordData(ba: BufferAccess) {
    this.recordBytes(ba);
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
