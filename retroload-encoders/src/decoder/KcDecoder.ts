import {BufferAccess} from 'retroload-common';
import {Logger} from '../Logger.js';
import {InputDataError} from '../Exceptions.js';
import {calculateChecksum8, hex8} from '../Utils.js';
import {type HalfPeriodProvider, SampleToHalfPeriodConverter} from './SampleToHalfPeriodConverter.js';
import {WaveDecoder} from './WaveDecoder.js';

type FrequencyRange = [number, number];

const one: FrequencyRange = [770, 1300];
const delimiter: FrequencyRange = [500, 670];
const zero: FrequencyRange = [1400, 2800];
const minIntroPeriods = 50;

export class KcDecoder {
  decode(ba: BufferAccess): BufferAccess[][] {
    const sampleProvider = new WaveDecoder(ba);
    const halfPeriodProvider = new SampleToHalfPeriodConverter(sampleProvider);
    const hpp = new HalfPeriodProcessor(halfPeriodProvider);
    let block: BufferAccess | undefined;
    let previousBlockNumber: number | undefined;
    const files: BufferAccess[][] = [];
    let blocks: BufferAccess[] = [];
    do {
      block = hpp.decodeBlock(true);
      if (block === undefined) {
        return files; // very last block reached
      }
      const blockNumber = block.getUint8(0);
      if (previousBlockNumber !== undefined) {
        if (blockNumber <= previousBlockNumber) {
          files.push(blocks);
          // begin of a new file
          blocks = [];
          if (blockNumber !== 0 && blockNumber !== 1) {
            Logger.info(`Warning: Got first block with block number ${hex8(blockNumber)}`);
          }
        } else if (blockNumber > previousBlockNumber + 1 && blockNumber !== 0xff) {
          Logger.info(`Warning: Missing block. Got block number ${hex8(blockNumber)} but expected was ${hex8(previousBlockNumber + 1)}.`);
        }
      }
      previousBlockNumber = blockNumber;
      blocks.push(block);
    } while (block !== undefined);

    return files;
  }
}

class HalfPeriodProcessor {
  private readonly halfPeriodProvider: HalfPeriodProvider;
  constructor(halfPeriodProvider: HalfPeriodProvider) {
    this.halfPeriodProvider = halfPeriodProvider;
  }

  decodeBlock(skipUnreadable = false): BufferAccess | undefined {
    let success = true;
    let block;
    do {
      block = undefined;
      try {
        block = this.decodeBlockImpl();
        success = true;
      } catch (e) {
        if (!skipUnreadable) {
          throw e;
        }
        success = false;
        if (e instanceof InputDataError) {
          Logger.error(e.message);
        }
      }
    } while (!success);

    return block;
  }

  decodeBlockImpl(): BufferAccess | undefined {
    const block = BufferAccess.create(130);
    if (!this.findValidIntro()) {
      return undefined;
    }
    Logger.info(`Reading block at ${this.getFormattedPosition()}`);
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
    Logger.debug(`Read block number 0x${blockNumber.toString(16).padStart(2, '0')}`);

    return block.slice(0, 129); // return slice with block number, but not checksum
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
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return false;
      }
    } while (isNot(f, one));
    this.halfPeriodProvider.rewindOne();

    return true;
  }

  /**
   * @returns intro length in half periods
   */
  findIntroEnd(): number {
    let introLength = 0;
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return introLength;
      }
      introLength++;
    } while (is(f, one));
    this.halfPeriodProvider.rewindOne();

    return introLength;
  }

  readDelimiter(): boolean {
    // check full oscillation
    const firstHalf = this.halfPeriodProvider.getNext();
    const secondHalf = this.halfPeriodProvider.getNext();

    if (firstHalf === undefined || secondHalf === undefined) {
      return false;
    }
    if (isNot(firstHalf, delimiter) || isNot(secondHalf, delimiter)) {
      return false;
    }

    return true;
  }

  readBit(): boolean | undefined {
    // check full oscillation
    const firstHalf = this.halfPeriodProvider.getNext();
    const secondHalf = this.halfPeriodProvider.getNext();
    if (firstHalf === undefined || secondHalf === undefined) {
      return undefined;
    }
    const isOne = is(firstHalf, one) && is(secondHalf, one);
    const isZero = is(firstHalf, zero) && is(secondHalf, zero);

    if (!isOne && !isZero) {
      return undefined;
    }

    return isOne;
  }

  readByte(): number {
    const delimiter = this.readDelimiter();
    if (!delimiter) {
      throw new InputDataError(`Did not found a delimiter at half period at ${this.getFormattedPosition()}.`);
    }
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new InputDataError(`Unable to detect bit at half period at ${this.getFormattedPosition()}.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    return byte;
  }

  private getFormattedPosition(): string {
    return `${this.halfPeriodProvider.getCurrentPositionSecond().toFixed(4)} s (sample ${this.halfPeriodProvider.getCurrentPositionSample()})`;
  }
}

function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}
