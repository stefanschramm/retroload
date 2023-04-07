import {Logger} from '../Logger.js';
import {SampleValue, type RecorderInterface} from './RecorderInterface.js';

const dataMap = {
  [SampleValue.High]: 1.0,
  [SampleValue.Low]: -1.0,
  [SampleValue.Zero]: 0.0,
};

export class PcmRecorder implements RecorderInterface {
  audioContext: any;
  data: number[] = [];
  sampleRate = 44100;
  constructor(audioContext) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.audioContext = audioContext;
  }

  initialize(sampleRate: number) {
    this.data = [];
    this.sampleRate = sampleRate;
  }

  pushSample(value: SampleValue) {
    this.data.push(dataMap[value]);
  }

  getAudioContextBuffer() {
    if (this.data.length === 0) {
      Logger.error('No data recorded!');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    buffer.copyToChannel(new Float32Array(this.data), 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return buffer;
  }
}
