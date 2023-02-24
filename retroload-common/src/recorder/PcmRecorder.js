import {Logger} from '../Logger.js';

const dataMap = {
  true: 1.0,
  false: -1.0,
  null: 0.0,
};

export class PcmRecorder {
  constructor(audioContext) {
    this.audioContext = audioContext;
  }

  initialize(sampleRate) {
    this.data = [];
    this.sampleRate = sampleRate;
  }

  pushSample(value) {
    this.data.push(dataMap[value]);
  }

  getAudioContextBuffer() {
    if (this.data.length === 0) {
      Logger.error('No data recorded!');
      return;
    }

    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    buffer.copyToChannel(new Float32Array(this.data), 0, 0);

    return buffer;
  }
}
