import {ArrayBufferWriter} from '../utils/array_buffer_writer.js';

const dataMap = {
  true: 0xfe,
  false: 0x02,
  null: 0x80,
};

export class WaveRecorder {
  initialize(sampleRate) {
    this.data = [];
    this.sampleRate = sampleRate;
  }
  pushSample(value) {
    this.data.push(dataMap[value]);
  }
  getBuffer() {
    const format = 1; // pcm
    const channels = 1;
    const bitsPerSample = 8;
    const formatChunkSize = 16;

    const headerSize = 4 + 8 + formatChunkSize + 8;
    const chunkSize = headerSize + this.data.length;

    const byteRate = this.sampleRate * channels * Math.floor(bitsPerSample / 8);
    const blockAlign = channels * Math.floor(bitsPerSample / 8);

    const buffer = new ArrayBuffer(chunkSize + 8);
    const bufferWriter = new ArrayBufferWriter(buffer);

    // RIFF section
    bufferWriter.write('RIFF');
    bufferWriter.writeUInt32LE(chunkSize);
    bufferWriter.write('WAVE');

    // Format section
    bufferWriter.write('fmt ');
    bufferWriter.writeUInt32LE(formatChunkSize);
    bufferWriter.writeUInt16LE(format);
    bufferWriter.writeUInt16LE(channels);
    bufferWriter.writeUInt32LE(this.sampleRate);
    bufferWriter.writeUInt32LE(byteRate);
    bufferWriter.writeUInt16LE(blockAlign);
    bufferWriter.writeUInt16LE(bitsPerSample);

    // Data section
    bufferWriter.write('data');
    bufferWriter.writeUInt32LE(this.data.length);

    const uint8Array = new Uint8Array(buffer);
    uint8Array.set(this.getRawBuffer(), bufferWriter.offset);

    return uint8Array;
  }
  getRawBuffer() {
    return new Uint8Array(this.data);
  }
}
