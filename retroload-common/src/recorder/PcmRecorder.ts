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
  sampleRate: any;
  constructor(audioContext) {
    this.audioContext = audioContext;
  }

  initialize(sampleRate) {
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

    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    buffer.copyToChannel(new Float32Array(this.data), 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return buffer;
  }
}
