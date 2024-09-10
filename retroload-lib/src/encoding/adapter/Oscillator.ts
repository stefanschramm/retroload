import {SampleValue, type RecorderInterface} from '../recorder/RecorderInterface.js';

export class Oscillator {
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

  public recordOscillations(frequency: number, oscillations: number) {
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

  public recordHalfOscillation(frequency: number) {
    const samples = Math.floor(this.recorder.sampleRate / frequency / 2);
    this.recordHalfOscillationSamples(samples);
  }

  public recordHalfOscillationSamples(samples: number) {
    for (let j = 0; j < samples; j += 1) {
      this.recorder.pushSample(this.phase ? SampleValue.High : SampleValue.Low);
    }
    this.phase = !this.phase;
  }

  public recordSeconds(frequency: number, seconds: number) {
    this.recordOscillations(frequency, frequency * seconds);
  }
}
