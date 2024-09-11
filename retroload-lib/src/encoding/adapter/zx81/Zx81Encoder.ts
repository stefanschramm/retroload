import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {recordByteMsbFirst, recordBytes, type ByteRecorder} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';

const fPulse = 3000;
const bitPause = 1.3; // ms

/**
 * Encoder for Sinclair ZX81
 */
export class Zx81Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fPulse, 9);
    } else {
      this.oscillator.recordOscillations(fPulse, 4);
    }
    this.oscillator.recordSilenceMs(bitPause);
  }
}
