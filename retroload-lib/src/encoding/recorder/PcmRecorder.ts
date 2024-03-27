import {InternalError} from '../../common/Exceptions.js';
import {AnnotationCollector, type Annotation} from './Annotations.js';
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
  private readonly annotationCollector = new AnnotationCollector();

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

  beginAnnotation(label: string): void {
    this.annotationCollector.beginAnnotation(label, {samples: this.data.length, seconds: this.data.length / this.sampleRate});
  }

  endAnnotation(): void {
    this.annotationCollector.endAnnotation({samples: this.data.length, seconds: this.data.length / this.sampleRate});
  }

  getAnnotations(): Annotation[] {
    return this.annotationCollector.getAnnotations();
  }
}
