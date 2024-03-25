import {type Annotation} from './Annotations.js';

export type RecorderInterface = {
  sampleRate: number;

  pushSample(value: SampleValue): void;
  beginAnnotation(label: string): void;
  endAnnotation(): void;
  getAnnotations(): Annotation[];
};

export enum SampleValue {
  Low = -1,
  Zero = 0,
  High = 1,
}
