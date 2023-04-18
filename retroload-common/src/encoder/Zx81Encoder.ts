import {type BufferAccess} from '../BufferAccess.js';
import {AbstractEncoder} from './AbstractEncoder.js';

const fPulse = 3000;
const bitPause = 0.0013; // s

/**
 * Encoder for Sinclair ZX81
 */
export class Zx81Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'zx81';
  }

  recordData(ba: BufferAccess) {
    this.recordBytes(ba);
  }

  override recordByte(byte: number) {
    this.recordByteMsbFirst(byte);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fPulse, 9);
    } else {
      this.recordOscillations(fPulse, 4);
    }
    this.recordSilence(this.recorder.sampleRate * bitPause);
  }
}
