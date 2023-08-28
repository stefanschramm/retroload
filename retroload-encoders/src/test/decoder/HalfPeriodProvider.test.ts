import {type HalfPeriodProvider} from '../../decoder/HalfPeriodProvider.js';
import {AveragingSampleToHalfPeriodConverter} from '../../decoder/AveragingSampleToHalfPeriodConverter.js';
import {StreamingSampleToHalfPeriodConverter} from '../../decoder/StreamingSampleToHalfPeriodConverter.js';
import {SampleProviderMock} from '../mocks/SampleProviderMock.js';

test('AveragingSampleToHalfPeriodConverter', () => {
  runTest(new AveragingSampleToHalfPeriodConverter(new SampleProviderMock()));
});

test('StreamingSampleToHalfPeriodConverter', () => {
  runTest(new StreamingSampleToHalfPeriodConverter(new SampleProviderMock()));
});

function runTest(hpp: HalfPeriodProvider) {
  expect(hpp.getCurrentPositionSample()).toBe(0);
  expect(hpp.getCurrentPositionSecond()).toBe(0);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getCurrentPositionSample()).toBe(2);
  expect(hpp.getCurrentPositionSecond()).toBeGreaterThan(0); // but just small fraction :)
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getCurrentPositionSample()).toBe(4);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getCurrentPositionSample()).toBe(6);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getCurrentPositionSample()).toBe(8);
  expect(hpp.getNext()).toBe(5512.5);
  expect(hpp.getCurrentPositionSample()).toBe(12);
  hpp.rewindOne();
  // expect(hpp.getCurrentPositionSample()).toBe(12); // TODO: Here the implementations currently behave different!
  expect(hpp.getNext()).toBe(5512.5);
  expect(hpp.getCurrentPositionSample()).toBe(12);
  expect(hpp.getNext()).toBe(undefined);
  // expect(hpp.getCurrentPositionSample()).toBe(12); // TODO: Here the implementations currently behave different!
}
