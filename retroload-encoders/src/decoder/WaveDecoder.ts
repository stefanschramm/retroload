import {type BufferAccess} from 'retroload-common';
import {InputDataError} from '../Exceptions.js';
import {Logger} from '../Logger.js';

const pcmFormatTag = 0x0001;

export type SampleProvider = {
  readonly sampleRate: number;
  getSamples(): number[];
};

export class WaveDecoder implements SampleProvider {
  readonly ba: BufferAccess;
  readonly sampleRate: number;
  readonly bitsPerSample: number;
  readonly channels: number;

  constructor(ba: BufferAccess) {
    this.ba = ba;
    if (!ba.containsDataAt(0, 'RIFF')) {
      throw new InputDataError('File does not seem to be a WAVE file.');
    }
    const formatTag = ba.getUint16Le(0x14);
    if (formatTag !== pcmFormatTag) {
      throw new InputDataError('WAVE file is not in PCM format.');
    }
    this.channels = ba.getUint16Le(0x16);
    if (this.channels > 1) {
      Logger.info('Multiple channels detected. Will use first channel for decoding.');
    }
    this.sampleRate = ba.getUint32Le(0x18);
    this.bitsPerSample = ba.getUint16Le(0x22);
    Logger.debug(`Format: PCM, Channels: ${this.channels}, Sample Rate: ${this.sampleRate}, Bits per sample: ${this.bitsPerSample}`);
    if (!ba.containsDataAt(0x24, 'data')) {
      throw new InputDataError('Unable to find data block of WAVE file.');
    }
  }

  public getSamples(): number[] {
    const blockAlign = this.ba.getUint16Le(0x20); // size of a frame in bytes
    const dataLength = this.ba.getUint32Le(0x28);
    if (dataLength !== this.ba.length() - 44) {
      Logger.info('Unexpected data length.');
    }
    const dataBa = this.ba.slice(0x2c);

    const samples = [];
    for (let i = 0; i < dataLength; i += blockAlign) {
      // Get data for first channel only.
      switch (this.bitsPerSample) {
        case 8:
          samples.push(dataBa.getUint8(i));
          continue;
        case 16:
          samples.push(dataBa.getUint16Le(i));
          continue;
        case 32:
          samples.push(dataBa.getUint32Le(i));
          continue;
        default:
          throw new InputDataError('Can only process 8, 16 or 32 bits per sample.');
      }
    }

    return samples;
  }
}
