import {InternalError} from '../Exceptions.js';
import {type OptionValues} from '../Options.js';
import {SampleValue, type RecorderInterface} from '../recorder/RecorderInterface.js';

/**
 * Base class for all encoders. Provides many methods commonly used.
 */
export class AbstractEncoder {
  recorder: RecorderInterface;
  phase: boolean;
  options: OptionValues;
  static getTargetName() {
    throw new InternalError('getTargetName() not implemented!');
  }

  constructor(recorder: RecorderInterface, options: OptionValues) {
    const sampleRate = 44100;
    this.recorder = recorder;
    this.recorder.initialize(sampleRate);
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

  recordBytes(dataBa) {
    for (let i = 0; i < dataBa.length(); i++) {
      this.recordByte(dataBa.getUint8(i));
    }
  }

  recordByte(byte) {
    // Default: LSB first
    this.recordByteLSBFirst(byte);
  }

  recordByteLSBFirst(byte) {
    for (let i = 0; i < 8; i += 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  recordByteMSBFirst(byte) {
    for (let i = 7; i >= 0; i -= 1) {
      this.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
    }
  }

  recordBit(value) {
    throw new InternalError('Encoder must implement recordBit().');
  }

  recordOscillations(frequency, oscillations) {
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

  recordHalfOscillation(frequency) {
    const samples = Math.floor(this.recorder.sampleRate / frequency / 2);
    this.recordHalfOscillationSamples(samples);
  }

  recordHalfOscillationSamples(samples) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(this.phase ? SampleValue.High : SampleValue.Low);
    }
    this.phase = !this.phase;
  }

  recordSeconds(frequency, seconds) {
    this.recordOscillations(frequency, frequency * seconds);
  }

  recordSilence(samples) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(SampleValue.Zero);
    }
  }

  recordSilenceMs(lengthMs) {
    this.recordSilence(lengthMs * this.recorder.sampleRate / 1000);
  }
}
