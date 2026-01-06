import {type BufferAccess} from '../../common/BufferAccess.js';
import {InputDataError} from '../../common/Exceptions.js';
import {Logger} from '../../common/logging/Logger.js';
import {type SampleProvider} from './SampleProvider.js';
import {hex16} from '../../common/Utils.js';

const pcmFormatTag = 0x0001;

export class WaveFileSampleProvider implements SampleProvider {
  public readonly sampleRate: number;
  public readonly bitsPerSample: number;
  public readonly channels: number;
  public readonly dataLength: number;
  private readonly ba: BufferAccess;
  private readonly skip: number;
  private readonly blockAlign: number;
  private readonly channel: number;

  private readonly dataChunkOffset: number;

  public constructor(ba: BufferAccess, skip: number, channel?: number) {
    this.ba = ba;
    this.skip = skip;
    if (this.skip !== 0) {
      Logger.debug(`Skipping ${this.skip} samples of input as requested. Following debug output will be relative to this position.`);
    }
    if (!ba.containsDataAt(0, 'RIFF')) {
      throw new InputDataError('File does not seem to be a WAVE file.');
    }
    const fmtHeaderLength = ba.getUint32Le(0x10);
    this.dataChunkOffset = 0x14 + fmtHeaderLength;
    const formatTag = ba.getUint16Le(0x14);
    if (formatTag !== pcmFormatTag) {
      throw new InputDataError(`WAVE file is not in PCM format. Format tag was: ${hex16(formatTag)}`);
    }
    this.channels = ba.getUint16Le(0x16);
    if (channel === undefined) {
      if (this.channels > 1) {
        Logger.info('Multiple channels detected and no specific channel selected. Will use channel 0 for decoding.');
      }
    } else if (channel >= this.channels) {
      throw new InputDataError(`Channel ${channel} was selected for decoding, but file only has ${this.channels} channels. Note: Channel numbering starts with 0.`);
    }
    this.channel = channel ?? 0;
    this.sampleRate = ba.getUint32Le(0x18);
    this.bitsPerSample = ba.getUint16Le(0x22);
    this.blockAlign = this.ba.getUint16Le(0x20); // size of a frame in bytes
    Logger.debug(`Format: PCM, Channels: ${this.channels}, Sample Rate: ${this.sampleRate}, Bits per sample: ${this.bitsPerSample}, Block align: ${this.blockAlign}`);
    if (!ba.containsDataAt(this.dataChunkOffset, 'data')) {
      throw new InputDataError('Unable to find data block of WAVE file.');
    }
    this.dataLength = this.ba.getUint32Le(this.dataChunkOffset + 4);
    // File might be padded with 0, so it's OK when buffer size exceeds this.dataLength.
    if (this.dataLength > this.ba.length() - this.dataChunkOffset + 8) {
      Logger.info('Unexpected data length.');
    }
    if (this.skip * this.blockAlign >= this.dataLength) {
      throw new InputDataError('Number of samples to skip exceeds data length.');
    }
  }

  public *getSamples(): Generator<number> {
    const dataBa = this.ba.slice(this.dataChunkOffset + 8);
    for (let i = this.skip * this.blockAlign; i < this.dataLength; i += this.blockAlign) {
      // Get data for first channel only.
      switch (this.bitsPerSample) {
        case 8:
          yield dataBa.getUint8(i + this.channel);
          continue;
        case 16:
          // 16 Bit WAVE files use signed integers. We normalize it to 16 bit unsigned integers.
          yield 2 ** 15 + dataBa.getInt16Le(i + 2 * this.channel);
          continue;
        case 32:
          // Unclear if this works. 32 bit files seem to use format tag 0xfffe.
          yield dataBa.getUint32Le(i + 4 * this.channel);
          continue;
        default:
          throw new InputDataError('Can only process 8, 16 or 32 bits per sample.');
      }
    }
  }
}
