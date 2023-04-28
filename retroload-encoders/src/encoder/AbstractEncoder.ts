import {type BufferAccess} from 'retroload-common';
import {InternalError} from '../Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {SampleValue, type RecorderInterface} from '../recorder/RecorderInterface.js';

/**
 * Base class for all encoders. Provides many methods commonly used.
 */
export abstract class AbstractEncoder {
  static getTargetName() {
    throw new InternalError('getTargetName() not implemented!');
  }

  protected options: OptionContainer;
  protected readonly recorder: RecorderInterface;
  private phase: boolean;

  constructor(recorder: RecorderInterface, options: OptionContainer) {
    this.recorder = recorder;
    /**
     * this.phase determines whether the next half oscillation is positive.
     * It's modified only when recording half oscillations.
     */
    this.phase = true;
    this.options = options;
  }

  begin() {
    this.recordSilence(this.recorder.sampleRate);
  }

  end() {
    this.recordSilence(this.recorder.sampleRate);
  }

  recordBytes(dataBa: BufferAccess) {
    for (let i = 0; i < dataBa.length(); i++) {
      this.recordByte(dataBa.getUint8(i));
    }
  }

  recordByte(byte: number) {
    // Default: LSB first
    this.recordByteLsbFirst(byte);
  }

  recordByteLsbFirst(byte: number) {
    for (let i = 0; i < 8; i += 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  recordByteMsbFirst(byte: number) {
    for (let i = 7; i >= 0; i -= 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  recordOscillations(frequency: number, oscillations: number) {
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

  recordHalfOscillation(frequency: number) {
    const samples = Math.floor(this.recorder.sampleRate / frequency / 2);
    this.recordHalfOscillationSamples(samples);
  }

  recordHalfOscillationSamples(samples: number) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(this.phase ? SampleValue.High : SampleValue.Low);
    }
    this.phase = !this.phase;
  }

  recordSeconds(frequency: number, seconds: number) {
    this.recordOscillations(frequency, frequency * seconds);
  }

  recordSilence(samples: number) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(SampleValue.Zero);
    }
  }

  recordSilenceMs(lengthMs: number) {
    this.recordSilence(lengthMs * this.recorder.sampleRate / 1000);
  }

  abstract recordBit(value: number): void;
}
