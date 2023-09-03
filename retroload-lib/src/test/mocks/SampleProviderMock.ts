import {type SampleProvider} from '../../decoding/sample_provider/SampleProvider.js';

export class SampleProviderMock implements SampleProvider {
  bitsPerSample = 8;
  sampleRate = 44100;
  * getSamples(): Generator<number> {
    const values = [
      0,
      0,
      255,
      255,
      0,
      0,
      255,
      255,
      0,
      0,
      0,
      0,
      255,
      255,
      255,
      255,
    ];
    for (const v of values) {
      yield v;
    }
  }
}
