import {type HalfPeriodProvider} from './HalfPeriodProvider.js';
import {AveragingSampleToHalfPeriodConverter} from './AveragingSampleToHalfPeriodConverter.js';
import {StreamingSampleToHalfPeriodConverter} from './StreamingSampleToHalfPeriodConverter.js';
import {SampleProviderMock} from '../../test/mocks/SampleProviderMock.js';

test('AveragingSampleToHalfPeriodConverter', () => {
  runTest(new AveragingSampleToHalfPeriodConverter(new SampleProviderMock()));
});

test('StreamingSampleToHalfPeriodConverter', () => {
  runTest(new StreamingSampleToHalfPeriodConverter(new SampleProviderMock()));
});

function runTest(hpp: HalfPeriodProvider) {
  expect(hpp.getPosition().samples).toBe(0);
  expect(hpp.getPosition().seconds).toBe(0);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getPosition().samples).toBe(2);
  expect(hpp.getPosition().seconds).toBeGreaterThan(0); // but just small fraction :)
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getPosition().samples).toBe(4);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getPosition().samples).toBe(6);
  expect(hpp.getNext()).toBe(11025);
  expect(hpp.getPosition().samples).toBe(8);
  expect(hpp.getNext()).toBe(5512.5);
  expect(hpp.getPosition().samples).toBe(12);
  hpp.rewindOne();
  // expect(hpp.getPosition().samples).toBe(12); // TODO: Here the implementations currently behave different!
  expect(hpp.getNext()).toBe(5512.5);
  expect(hpp.getPosition().samples).toBe(12);
  expect(hpp.getNext()).toBe(undefined);
  // expect(hpp.getPosition().samples).toBe(12); // TODO: Here the implementations currently behave different!
}
