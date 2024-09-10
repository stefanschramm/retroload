import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {recordByteLsbFirst, recordByteMsbFirst, recordBytes, type ByteRecorder} from './ByteRecorder.js';
import {Oscillator} from './Oscillator.js';

/**
 * Base class for all encoders. Provides many methods commonly used.
 *
 * TODO: To be removed. Encoders should use Oscillator and implement ByteRecorder by themselves.
 */
export abstract class AbstractEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  constructor(protected readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin() {
    this.oscillator.begin();
  }

  public end() {
    this.oscillator.end();
  }

  public recordSilence(samples: number) {
    this.oscillator.recordSilence(samples);
  }

  public recordSilenceMs(lengthMs: number) {
    this.oscillator.recordSilenceMs(lengthMs);
  }

  public recordBytes(dataBa: BufferAccess) {
    recordBytes(this, dataBa);
  }

  public recordByte(byte: number) {
    // Default: LSB first
    recordByteLsbFirst(this, byte);
  }

  public abstract recordBit(value: number): void;

  protected recordOscillations(frequency: number, oscillations: number) {
    this.oscillator.recordOscillations(frequency, oscillations);
  }

  protected recordHalfOscillation(frequency: number) {
    this.oscillator.recordHalfOscillation(frequency);
  }

  protected recordHalfOscillationSamples(samples: number) {
    this.oscillator.recordHalfOscillationSamples(samples);
  }

  protected recordSeconds(frequency: number, seconds: number) {
    this.oscillator.recordSeconds(frequency, seconds);
  }

  protected recordByteLsbFirst(byte: number) {
    recordByteLsbFirst(this, byte);
  }

  protected recordByteMsbFirst(byte: number) {
    recordByteMsbFirst(this, byte);
  }
}
