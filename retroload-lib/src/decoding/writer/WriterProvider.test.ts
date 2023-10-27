import writers from './WriterProvider.js';

test('WriterProvider provides writers', () => {
  expect(writers.length).toBeGreaterThan(0);
});
