import {expect, test} from 'vitest';
import {AnnotationCollector} from './Annotations.js';
import {InternalError} from '../../common/Exceptions.js';

test('Collects annotations', () => {
  // Example annotations:
  // 0 s                  1 s                  2s
  // -------------------------------------------
  // |label 0                                  |
  // ---------------------|---------------------
  // |label 0.1           |label 0.2           |
  // ---------------------|---------------------

  const collector = new AnnotationCollector();
  collector.beginAnnotation('label 0', {samples: 0, seconds: 0});
  collector.beginAnnotation('label 0.0', {samples: 0, seconds: 0});
  collector.endAnnotation({samples: 44100, seconds: 1});
  collector.beginAnnotation('label 0.1', {samples: 44100, seconds: 1});
  collector.endAnnotation({samples: 88200, seconds: 2});
  collector.endAnnotation({samples: 88200, seconds: 2});

  const annotations = collector.getAnnotations();

  expect(annotations.length).toBe(1);
  expect(annotations[0].label).toBe('label 0');
  expect(annotations[0].begin).toStrictEqual({samples: 0, seconds: 0});
  expect(annotations[0].end).toStrictEqual({samples: 88200, seconds: 2});
  expect(annotations[0].annotations.length).toBe(2);

  expect(annotations[0].annotations[0].label).toBe('label 0.0');
  expect(annotations[0].annotations[0].begin).toStrictEqual({samples: 0, seconds: 0});
  expect(annotations[0].annotations[0].end).toStrictEqual({samples: 44100, seconds: 1});
  expect(annotations[0].annotations[0].annotations.length).toBe(0);

  expect(annotations[0].annotations[1].label).toBe('label 0.1');
  expect(annotations[0].annotations[1].begin).toStrictEqual({samples: 44100, seconds: 1});
  expect(annotations[0].annotations[1].end).toStrictEqual({samples: 88200, seconds: 2});
  expect(annotations[0].annotations[1].annotations.length).toBe(0);
});

test('Throws exception on invalid encapsulation', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exception: any;
  try {
    const collector = new AnnotationCollector();
    collector.beginAnnotation('label 0', {samples: 1, seconds: 44100});
    collector.beginAnnotation('label 0.0', {samples: 0, seconds: 0}); // begin before parent annotation
  } catch (e) {
    exception = e;
  }
  expect(exception).toBeInstanceOf(InternalError);
});

test('Throws exception when end is before begin', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exception: any;
  try {
    const collector = new AnnotationCollector();
    collector.beginAnnotation('label 0', {samples: 88200, seconds: 2});
    collector.endAnnotation({samples: 1, seconds: 44100});
  } catch (e) {
    exception = e;
  }
  expect(exception).toBeInstanceOf(InternalError);
});

test('Throws exception when begin is before end of previous annotation in same level', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exception: any;
  try {
    const collector = new AnnotationCollector();
    collector.beginAnnotation('label 0', {samples: 0, seconds: 0});
    collector.endAnnotation({samples: 2, seconds: 88200});
    collector.beginAnnotation('label 1', {samples: 44100, seconds: 1});
  } catch (e) {
    exception = e;
  }
  expect(exception).toBeInstanceOf(InternalError);
});

test('Throws exception when trying to close unopened annotation', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exception: any;
  try {
    const collector = new AnnotationCollector();
    collector.endAnnotation({samples: 1, seconds: 44100});
  } catch (e) {
    exception = e;
  }
  expect(exception).toBeInstanceOf(InternalError);
});
