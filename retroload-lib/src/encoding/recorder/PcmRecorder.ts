import {InternalError} from '../../common/Exceptions.js';
import {SampleValue, type RecorderInterface} from './RecorderInterface.js';

const dataMap = {
  [SampleValue.High]: 1.0,
  [SampleValue.Low]: -1.0,
  [SampleValue.Zero]: 0.0,
};

export class PcmRecorder implements RecorderInterface {
  audioContext: AudioContext;
  data: number[] = [];
  sampleRate = 44100;
  constructor(audioContext: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.audioContext = audioContext;
  }

  pushSample(value: SampleValue) {
    this.data.push(dataMap[value]);
  }

  getAudioContextBuffer(): AudioBuffer {
    if (this.data.length === 0) {
      throw new InternalError('No data recorded!');
    }

    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    buffer.copyToChannel(new Float32Array(this.data), 0, 0);

    return buffer;
  }
}
