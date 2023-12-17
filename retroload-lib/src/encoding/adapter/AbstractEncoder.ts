import {type BufferAccess} from '../../common/BufferAccess.js';
import {SampleValue, type RecorderInterface} from '../recorder/RecorderInterface.js';

/**
 * Base class for all encoders. Provides many methods commonly used.
 */
export abstract class AbstractEncoder {
  /**
   * this.phase determines whether the next half oscillation is positive.
   * It's modified only when recording half oscillations.
   */
  private phase = true;

  constructor(protected readonly recorder: RecorderInterface) {
  }

  public begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  public end() {
    this.recordSilence(this.recorder.sampleRate);
  }

  public recordSilence(samples: number) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(SampleValue.Zero);
    }
  }

  public recordSilenceMs(lengthMs: number) {
    this.recordSilence(lengthMs * this.recorder.sampleRate / 1000);
  }

  public recordBytes(dataBa: BufferAccess) {
    for (let i = 0; i < dataBa.length(); i++) {
      this.recordByte(dataBa.getUint8(i));
    }
  }

  public recordByte(byte: number) {
    // Default: LSB first
    this.recordByteLsbFirst(byte);
  }

  protected recordOscillations(frequency: number, oscillations: number) {
    const samples = Math.floor(this.recorder.sampleRate / frequency / 2);
    for (let i = 0; i < oscillations; i += 1) {
      for (const value of (this.phase ? [SampleValue.High, SampleValue.Low] : [SampleValue.Low, SampleValue.High])) {
        for (let j = 0; j < samples; j += 1) {
          this.recorder.pushSample(value);
        }
      }
    }
    // (no need to toggle phase)
  }

  protected recordHalfOscillation(frequency: number) {
    const samples = Math.floor(this.recorder.sampleRate / frequency / 2);
    this.recordHalfOscillationSamples(samples);
  }

  protected recordHalfOscillationSamples(samples: number) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(this.phase ? SampleValue.High : SampleValue.Low);
    }
    this.phase = !this.phase;
  }

  protected recordSeconds(frequency: number, seconds: number) {
    this.recordOscillations(frequency, frequency * seconds);
  }

  protected recordByteLsbFirst(byte: number) {
    for (let i = 0; i < 8; i += 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  protected recordByteMsbFirst(byte: number) {
    for (let i = 7; i >= 0; i -= 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  protected abstract recordBit(value: number): void;
}
