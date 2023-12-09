import {AbstractEncoder} from '../AbstractEncoder.js';

const fPulse = 3000;
const bitPause = 0.0013; // s

/**
 * Encoder for Sinclair ZX81
 */
export class Zx81Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'zx81';
  }

  public override begin(): void {
    this.recordSilence(this.recorder.sampleRate); // TODO: shorten
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
