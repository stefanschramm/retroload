import {BufferAccess} from 'retroload-common';
import {SampleValue, type RecorderInterface} from './RecorderInterface.js';

const dataMap: Record<SampleValue, number> = {
  [SampleValue.High]: 0xfe,
  [SampleValue.Low]: 0x02,
  [SampleValue.Zero]: 0x80,
};

export class WaveRecorder implements RecorderInterface {
  data: number[] = [];
  sampleRate = 44100;
  bitsPerSample = 8;
  channels = 1;

  pushSample(value: SampleValue) {
    const mappedValue = dataMap[value];
    this.data.push(mappedValue);
  }

  getBuffer() {
    const format = 1; // pcm
    const formatChunkSize = 16;

    const headerSize = 4 + 8 + formatChunkSize + 8;
    const chunkSize = headerSize + this.data.length;

    const byteRate = this.sampleRate * this.channels * Math.floor(this.bitsPerSample / 8);
    const blockAlign = this.channels * Math.floor(this.bitsPerSample / 8);

    const ba = BufferAccess.create(chunkSize + 8);

    // RIFF section
    ba.writeAsciiString('RIFF');
    ba.writeUint32Le(chunkSize);
    ba.writeAsciiString('WAVE');

    // Format section
    ba.writeAsciiString('fmt ');
    ba.writeUint32Le(formatChunkSize);
    ba.writeUint16Le(format);
    ba.writeUint16Le(this.channels);
    ba.writeUint32Le(this.sampleRate);
    ba.writeUint32Le(byteRate);
    ba.writeUint16Le(blockAlign);
    ba.writeUint16Le(this.bitsPerSample);

    // Data section
    ba.writeAsciiString('data');
    ba.writeUint32Le(this.data.length);

    ba.writeBa(BufferAccess.createFromUint8Array(this.getRawBuffer()));

    return ba.asUint8Array();
  }

  getRawBuffer() {
    return new Uint8Array(this.data);
  }
}
