import {BufferAccess} from 'retroload-lib';
import {type Changes} from './EditorState.js';
import fs from 'fs';

const pcmFormatTag = 0x0001;
const dataOffset = 44;

export class WavFile {
  private sampleCount: number;
  private file: number;
  private header: WavHeader;

  constructor(
    private readonly fileName: string,
    private readonly channel: number,
  ) {
    const openResult = this.open();
    this.file = openResult.file;
    this.header = openResult.header;
    this.sampleCount = openResult.sampleCount;
  }

  public getFileName(): string {
    return this.fileName;
  }

  public getSampleCount(): number {
    return this.sampleCount;
  }

  public getSampleRate(): number {
    return this.header.sampleRate;
  }

  public getChannelCount(): number {
    return this.header.channels;
  }

  public getSamples(offset: number, sampleCount: number): number[] {
    const position = dataOffset + offset * this.header.blockAlign;
    const length = sampleCount * this.header.blockAlign;
    const buffer = Buffer.alloc(length);
    fs.readSync(this.file, buffer, {position, length});
    const ba = BufferAccess.createFromNodeBuffer(buffer);
    const samples = [];
    for (let i = 0; i < sampleCount; i++) {
      samples.push(ba.getUint8(i * this.header.blockAlign + this.channel));
    }

    return samples;
  }

  public write(changes: Changes): void {
    for (const x of Object.keys(changes)) {
      const xInt = parseInt(x, 10); // ugly!
      if (xInt < 0 || xInt > this.sampleCount) {
        throw new Error(`Invalid changed sample position: ${xInt}`);
      }
      const position = dataOffset + xInt * this.header.blockAlign + this.channel;
      const data = new Uint8Array([changes[xInt]]);
      const written = fs.writeSync(this.file, data, 0, 1, position);
      if (written !== 1) {
        throw new Error(`Write unsuccessfull. writeSync returned ${written}.`);
      }
    }
  }

  public reload(): void {
    this.close();
    const openResult = this.open();
    this.file = openResult.file;
    this.header = openResult.header;
    this.sampleCount = openResult.sampleCount;
  }

  private open(): {file: number; header: WavHeader; sampleCount: number} {
    const file = fs.openSync(this.fileName, 'r+');
    const headerLength = 0x2c;
    const headerBuffer = Buffer.alloc(headerLength);
    fs.readSync(file, headerBuffer, {length: headerLength});
    const header = readHeader(BufferAccess.createFromNodeBuffer(headerBuffer));
    if (header.bitsPerSample !== 8) {
      throw new Error(`Currently only WAV files with 8 bits per sample can be read. File header reports ${header.bitsPerSample} bits.`);
    }
    const sampleCount = header.dataLength / header.blockAlign;

    if (this.channel >= header.channels) {
      throw new Error(`Channel ${this.channel} was selected, but file only has ${header.channels} channel(s). Note: Channel numbering starts with 0.`);
    }

    return {
      file,
      header,
      sampleCount,
    };
  }

  private close(): void {
    fs.close(this.file);
  }
}

function readHeader(ba: BufferAccess): WavHeader {
  if (!ba.containsDataAt(0, 'RIFF')) {
    throw new Error('File does not seem to be a WAVE file.');
  }
  const formatTag = ba.getUint16Le(0x14);
  if (formatTag !== pcmFormatTag) {
    throw new Error('WAVE file is not in PCM format.');
  }
  if (!ba.containsDataAt(0x24, 'data')) {
    throw new Error('Unable to find data block of WAVE file.');
  }

  return {
    channels: ba.getUint16Le(0x16),
    sampleRate: ba.getUint32Le(0x18),
    bitsPerSample: ba.getUint16Le(0x22),
    blockAlign: ba.getUint16Le(0x20), // size of a frame in bytes
    dataLength: ba.getUint32Le(0x28),
  };
}

type WavHeader = {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  blockAlign: number;
  dataLength: number;
};
