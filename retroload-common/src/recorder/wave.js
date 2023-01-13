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
    this.data.push(value);
  }
  getBuffer() {
    const format = 1; // pcm
    const channels = 1;
    const bitsPerSample = 8;
    const formatChunkSize = 16;
    const dataChunkSize = this.data.length * channels * Math.floor(bitsPerSample / 8);
    const chunkSize = 4 + 8 + formatChunkSize + 8 + dataChunkSize;
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
    bufferWriter.writeUInt32LE(dataChunkSize);

    for (const sample of this.data) {
      bufferWriter.writeUInt8(dataMap[sample]);
    }

    return new Uint8Array(buffer);
  }
  getRawBuffer() {
    const channels = 1;
    const bitsPerSample = 8;
    const dataChunkSize = this.data.length * channels * Math.floor(bitsPerSample / 8);
    const buffer = new ArrayBuffer(dataChunkSize);
    const bufferWriter = new ArrayBufferWriter(buffer);
    for (const sample of this.data) {
      bufferWriter.writeUInt8(dataMap[sample]);
    }
    return new Uint8Array(buffer);
  }
}
