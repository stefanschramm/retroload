import {ByteRecorder, recordByteMsbFirst} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

export class LaserVzEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(1660, 3);
    } else {
      this.oscillator.recordOscillations(1660, 1);
      this.oscillator.recordOscillations(830, 1);
    }
  }
}
