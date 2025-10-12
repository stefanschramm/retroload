import {type SampleProvider} from '../../decoding/sample_provider/SampleProvider.js';

export class SampleProviderMock implements SampleProvider {
  public bitsPerSample = 8;
  public sampleRate = 44100;

  public *getSamples(): Generator<number> {
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
