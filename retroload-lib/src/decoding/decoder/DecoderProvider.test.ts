import decoders from './DecoderProvider.js';

test('DecoderProvider provides decoders', () => {
  expect(decoders.length).toBeGreaterThan(0);
});
