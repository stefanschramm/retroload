import {type RecorderInterface, type SampleValue} from '../../recorder/RecorderInterface.js';
import {describe, expect, it} from 'vitest';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Poly880Encoder} from './Poly880Encoder.js';

describe('Poly880Encoder', () => {
  it('writes 32-byte frames with LSB-first data, additive checksum, and zero padding', () => {
    const samples: SampleValue[] = [];
    const recorder: RecorderInterface = {
      sampleRate: 4800,
      pushSample(value) {
        samples.push(value);
      },
      beginAnnotation: () => undefined,
      endAnnotation: () => undefined,
      getAnnotations() {
        return [];
      },
    };

    const encoder = new Poly880Encoder(recorder);
    encoder.begin();
    encoder.recordData(BufferAccess.createFromUint8Array(new Uint8Array([0xa5])));
    encoder.end();

    expect(samples).toHaveLength(8528);

    const keyOffset = 2400 + 56 + 112 + 8;
    const dataOffset = keyOffset + (16 * 4);
    const checksumOffset = dataOffset + (32 * 8 * 4);
    expect(decodeBits(samples, keyOffset, 16)).toEqual(new Array(16).fill(0));
    expect(decodeByte(samples, dataOffset)).toBe(0xa5);
    expect(decodeByte(samples, dataOffset + (8 * 4))).toBe(0x00);
    expect(decodeWord(samples, checksumOffset)).toBe(0x00a5);
  });
});

function decodeBits(samples: SampleValue[], offset: number, bitCount: number): number[] {
  return Array.from({length: bitCount}, (_value, index) => {
    const bitOffset = offset + index * 4;
    return samples[bitOffset] === samples[bitOffset + 2] ? 1 : 0;
  });
}

function decodeByte(samples: SampleValue[], offset: number): number {
  return decodeBits(samples, offset, 8).reduce((byte, bit, index) => byte | (bit << index), 0);
}

function decodeWord(samples: SampleValue[], offset: number): number {
  return decodeBits(samples, offset, 16).reduce((word, bit, index) => word | (bit << index), 0);
}
