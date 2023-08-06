import {BufferAccess} from 'retroload-common';
import {Logger} from '../Logger.js';
import {InputDataError} from '../Exceptions.js';
import {calculateChecksum8} from '../Utils.js';
import {type HalfPeriodProvider, SampleToHalfPeriodConverter} from './SampleToHalfPeriodConverter.js';
import {WaveDecoder} from './WaveDecoder.js';

const one = [880, 1250];
const delimiter = [500, 670];
const zero = [1400, 2800];
const minIntroPeriods = 50;

export class KcDecoder {
  decode(ba: BufferAccess) {
    const hpp = new HalfPeriodProcessor(new SampleToHalfPeriodConverter(new WaveDecoder(ba)));
    let block: BufferAccess | undefined;
    while (undefined !== (block = hpp.decodeBlock())) {
      Logger.debug(block.asHexDump());
    }
  }
}

class HalfPeriodProcessor {
  private readonly halfPeriods: number[];
  private i = 0;
  constructor(halfPeriodProvider: HalfPeriodProvider) {
    this.halfPeriods = halfPeriodProvider.getHalfPeriods();
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
