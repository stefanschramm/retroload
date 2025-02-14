import {describe, expect, test} from 'vitest';
import {BufferAccess} from '../../common/BufferAccess.js';
import {InputDataError} from '../../common/Exceptions.js';
import {WaveFileSampleProvider} from './WaveFileSampleProvider.js';

// 35 samples, 8 bit PCM, 1 channel, 44100 Hz sample rate, padded with one 0 byte, maximum amplitude square wave
//
// 00000000  52 49 46 46 48 00 00 00  57 41 56 45 66 6d 74 20  |RIFFH...WAVEfmt |
// 00000010  10 00 00 00 01 00 01 00  44 ac 00 00 44 ac 00 00  |........D...D...|
// 00000020  01 00 08 00 64 61 74 61  23 00 00 00 ff ff ff ff  |....data#.......|
// 00000030  ff 00 00 00 00 00 ff ff  ff ff ff 00 00 00 00 00  |................|
// 00000040  ff ff ff ff ff 00 00 00  00 00 ff ff ff ff ff 00  |................|
// 00000050

const fixture = 'UklGRkgAAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YSMAAAD//////wAAAAAA//////8AAAAAAP//////AAAAAAD//////wA=';

describe('WaveFileSampleProvider', () => {
  test('reads header and samples', () => {
    const sp = new WaveFileSampleProvider(getFixture(), 0);
    const generator = sp.getSamples();

    // Correct decoding of WAVE header
    expect(sp.bitsPerSample).toBe(8);
    expect(sp.channels).toBe(1);
    expect(sp.sampleRate).toBe(44100);
    expect(sp.dataLength).toBe(35);

    // Individual samples
    const pattern = [[5, 0xff], [5, 0x00], [5, 0xff], [5, 0x00], [5, 0xff], [5, 0x00], [5, 0xff]];
    for (const p of pattern) {
      for (let i = 0; i < p[0]; i++) {
        const cur = generator.next();
        expect(cur.value).toBe(p[1]);
        expect(cur.done).toBe(false);
      }
    }

    // End reached
    const end = generator.next();
    expect(end.done).toBe(true);
    expect(end.value).toBe(undefined);
  });

  test('skips samples correctly', () => {
    const sp = new WaveFileSampleProvider(getFixture(), 22);
    const generator = sp.getSamples();
    const pattern = [[3, 0xff], [5, 0x00], [5, 0xff]];
    for (const p of pattern) {
      for (let i = 0; i < p[0]; i++) {
        const cur = generator.next();
        expect(cur.value).toBe(p[1]);
      }
    }
    expect(generator.next().done).toBe(true);
  });

  test('throws exception if skip argument exceeds sample count', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let exception: any;
    try {
      // eslint-disable-next-line no-new
      new WaveFileSampleProvider(getFixture(), 35);
    } catch (e) {
      exception = e;
    }
    expect(exception).toBeInstanceOf(InputDataError);
  });
});

function getFixture(): BufferAccess {
  return BufferAccess.createFromNodeBuffer(Buffer.from(fixture, 'base64'));
}
