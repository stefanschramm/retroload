import {InternalError} from '../../common/Exceptions.js';
import {AnnotationCollector, type Annotation} from './Annotations.js';
import {SampleValue, type RecorderInterface} from './RecorderInterface.js';

const dataMap = {
  [SampleValue.High]: 1.0,
  [SampleValue.Low]: -1.0,
  [SampleValue.Zero]: 0.0,
};

export class PcmRecorder implements RecorderInterface {
  public sampleRate = 44100;
  private readonly audioContext: AudioContext;
  private readonly data: number[] = [];
  private readonly annotationCollector = new AnnotationCollector();

  public constructor(audioContext: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.audioContext = audioContext;
  }

  public pushSample(value: SampleValue): void {
    this.data.push(dataMap[value]);
  }

  public getAudioContextBuffer(): AudioBuffer {
    if (this.data.length === 0) {
      throw new InternalError('No data recorded!');
    }

    const buffer = this.audioContext.createBuffer(1, this.data.length, this.sampleRate);
    buffer.copyToChannel(new Float32Array(this.data), 0, 0);

    return buffer;
  }

  public beginAnnotation(label: string): void {
    this.annotationCollector.beginAnnotation(label, {samples: this.data.length, seconds: this.data.length / this.sampleRate});
  }

  public endAnnotation(): void {
    this.annotationCollector.endAnnotation({samples: this.data.length, seconds: this.data.length / this.sampleRate});
  }

  public getAnnotations(): Annotation[] {
    return this.annotationCollector.getAnnotations();
  }
}
