import {type Annotation, AnnotationCollector} from './Annotations.js';
import {type RecorderInterface, SampleValue} from './RecorderInterface.js';
import {InternalError} from '../../common/Exceptions.js';

const dataMap = {
  [SampleValue.High]: 1.0,
  [SampleValue.Low]: -1.0,
  [SampleValue.Zero]: 0.0,
};

export class FloatRecorder implements RecorderInterface {
  public sampleRate = 44100;
  private readonly data: number[] = [];
  private readonly annotationCollector = new AnnotationCollector();

  public pushSample(value: SampleValue): void {
    this.data.push(dataMap[value]);
  }

  public getFloat32Array(): Float32Array {
    if (this.data.length === 0) {
      throw new InternalError('No data recorded!');
    }

    return new Float32Array(this.data);
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
