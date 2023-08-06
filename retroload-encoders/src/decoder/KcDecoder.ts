import {BufferAccess} from 'retroload-common';
import {Logger} from '../Logger.js';
import {InputDataError} from '../Exceptions.js';
import {calculateChecksum8} from '../Utils.js';

const pcmFormatTag = 0x0001;

const one = [882, 1225];
const delimiter = [501, 668];
const zero = [1470, 3150];
const minIntroPeriods = 50;

export class KcDecoder {
  decode(ba: BufferAccess) {
    const wd = new WaveDecoder(ba);
    const hpp = new HalfPeriodProcessor(wd.getHalfPeriods());
    let block: BufferAccess | undefined;
    while (undefined !== (block = hpp.decodeBlock())) {
      Logger.debug(block.asHexDump());
    }
  }
}

class WaveDecoder {
  ba: BufferAccess;
  sampleRate: number;
  bitsPerSample: number;
  channels: number;

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

  /**
   * @returns List of frequency values (Hz) for all half periods
   */
  public getHalfPeriods(): number[] {
    const samples = this.getSamples();
    const offset = this.determineOffset(samples);

    const halfPeriods = [];
    let length = 1;
    let positive = samples[0] > offset;
    for (let i = 1; i < samples.length; i++) {
      const currentPositive = samples[i] > offset;
      if (positive !== currentPositive) {
        halfPeriods.push(this.sampleRate / (length * 2));
        length = 0;
        positive = currentPositive;
      }
      length++;
    }

    // const histogram = getHistogram(halfPeriods);
    // console.log(histogram);

    return halfPeriods;
  }

  private determineOffset(samples: number[]): number {
    let min = 0;
    let max = 0;
    for (const s of samples) {
      if (s > max) {
        max = s;
      } else if (s < min) {
        min = s;
      }
    }
    return (max - min) / 2;
  }

  private getSamples(): number[] {
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

class HalfPeriodProcessor {
  private readonly halfPeriods: number[];
  private i = 0;
  constructor(halfPeriods: number[]) {
    this.halfPeriods = halfPeriods;
  }

  decodeBlock(): BufferAccess | undefined {
    const block = BufferAccess.create(130);
    if (!this.findValidIntro()) {
      return undefined;
    }
    for (let i = 0; i < 130; i++) {
      const byte = this.readByte();
      block.writeUint8(byte);
    }
    const blockNumber = block.getUint8(0);
    const calculatedChecksum = calculateChecksum8(block.slice(1, 128));
    const readChecksum = block.getUint8(129);
    if (calculatedChecksum !== readChecksum) {
      Logger.error(`Warning: Invalid checksum for block ${blockNumber}! Read checksum: ${readChecksum}, Calculated checksum: ${calculatedChecksum}.`);
    }

    return block.slice(0, 129); // return block number, but not checksum
  }

  findValidIntro(): boolean {
    do {
      if (!this.findIntroStart()) {
        return false; // end reached
      }
    } while (this.findIntroEnd() < minIntroPeriods);

    return true;
  }

  findIntroStart(): boolean {
    while (this.halfPeriods[this.i] < one[0] || this.halfPeriods[this.i] > one[1]) {
      this.i++;
      if (this.i >= this.halfPeriods.length) {
        return false;
      }
    }

    return true;
  }

  /**
   * @returns intro length
   */
  findIntroEnd(): number {
    const introStart = this.i;
    while (this.halfPeriods[this.i] >= one[0] && this.halfPeriods[this.i] <= one[1]) {
      this.i++;
    }
    const introLength = this.i - introStart;
    return introLength;
    // TODO: check for data end
  }

  readDelimiter(): boolean {
    const firstHalf = this.halfPeriods[this.i++];
    const secondHalf = this.halfPeriods[this.i++];
    if (firstHalf < delimiter[0] || firstHalf > delimiter[1] || secondHalf < delimiter[0] || secondHalf > delimiter[1]) {
      return false;
    }

    return true;
  }

  readBit(): boolean | undefined {
    const firstHalf = this.halfPeriods[this.i++];
    const secondHalf = this.halfPeriods[this.i++];
    const isOne = (firstHalf >= one[0] && firstHalf <= one[1] && secondHalf >= one[0] && secondHalf <= one[1]);
    const isZero = (firstHalf >= zero[0] && firstHalf <= zero[1] && secondHalf >= zero[0] && secondHalf <= zero[1]);

    if (!isOne && !isZero) {
      return undefined;
    }

    return isOne;
  }

  readByte(): number {
    const delimiter = this.readDelimiter();
    if (!delimiter) {
      throw new InputDataError(`Did not found a delimiter at half period offset ${this.i}.`);
    }
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new InputDataError(`Unable to detect bit at half period offset ${this.i}.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    return byte;
  }
}
/*
type Histogram = Record<number, number>;

function getHistogram(halfPeriods: number[]) {
  const histogram: Histogram = {};
  for (const hp of halfPeriods) {
    if (histogram[hp] === undefined) {
      histogram[hp] = 1;
    }
    else {
      histogram[hp]++;
    }
  }

  return histogram;
}
*/
