import decoders from './Decoders.js';

test('DecoderProvider provides decoders', () => {
  expect(decoders.length).toBeGreaterThan(0);
});
