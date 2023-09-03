import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../decoder/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8} from '../../../common/Utils.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../ConverterExceptions.js';
import {type PositionProvider, formatPosition} from '../../../common/Positioning.js';
import {BlockDecodingResult, BlockDecodingResultStatus, type KcBlockProvider} from './KcBlockProvider.js';

type FrequencyRange = [number, number];

const one: FrequencyRange = [770, 1300];
const delimiter: FrequencyRange = [500, 670];
const zero: FrequencyRange = [1400, 2800];
const minIntroPeriods = 200;

/**
 * Decode half periods into blocks.
 */
export class KcHalfPeriodProcessor implements PositionProvider, KcBlockProvider {
  private readonly halfPeriodProvider: HalfPeriodProvider;
  constructor(halfPeriodProvider: HalfPeriodProvider) {
    this.halfPeriodProvider = halfPeriodProvider;
  }

  * blocks(): Generator<BlockDecodingResult> {
    let keepGoing = true;
    do {
      try {
        yield this.decodeBlockImpl();
      } catch (e) {
        if (e instanceof BlockStartNotFound) {
          continue;
        } else if (e instanceof EndOfInput) {
          keepGoing = false;
        } else {
          throw e;
        }
      }
    } while (keepGoing);
  }

  public getCurrentPositionSample() {
    return this.halfPeriodProvider.getCurrentPositionSample();
  }

  public getCurrentPositionSecond() {
    return this.halfPeriodProvider.getCurrentPositionSecond();
  }

  private decodeBlockImpl(): BlockDecodingResult {
    if (!this.findValidIntro()) {
      throw new EndOfInput();
    }
    Logger.debug(`${formatPosition(this)} Reading block...`);
    const blockBeginSeconds = this.getCurrentPositionSecond();
    const block = BufferAccess.create(130);
    for (let i = 0; i < 130; i++) {
      try {
        const byte = this.readByte();
        block.writeUint8(byte);
      } catch (e) {
        if (e instanceof DecodingError) {
          Logger.error(e.message);
          if (i === 0) {
            throw new BlockStartNotFound();
          }
          return new BlockDecodingResult(
            block.slice(0, 129),
            BlockDecodingResultStatus.Partial,
            blockBeginSeconds,
            this.getCurrentPositionSecond(),
          );
        }
        throw e; // unknown exception
      }
    }

    const blockNumber = block.getUint8(0);
    const calculatedChecksum = calculateChecksum8(block.slice(1, 128));
    const readChecksum = block.getUint8(129);
    const checksumCorrect = calculatedChecksum === readChecksum;
    if (!checksumCorrect) {
      Logger.error(`Warning: Invalid checksum for block ${blockNumber}! Read checksum: ${readChecksum}, Calculated checksum: ${calculatedChecksum}.`);
    }
    Logger.debug(`${formatPosition(this)} Finished reading block number 0x${blockNumber.toString(16).padStart(2, '0')}`);

    // return slice with block number, but not checksum
    return new BlockDecodingResult(
      block.slice(0, 129),
      checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
      blockBeginSeconds,
      this.getCurrentPositionSecond(),
    );
  }

  private findValidIntro(): boolean {
    do {
      if (!this.findIntroStart()) {
        return false; // end reached
      }
    } while (this.findIntroEnd() < minIntroPeriods);

    return true;
  }

  private findIntroStart(): boolean {
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
  private findIntroEnd(): number {
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

  private readDelimiter(): boolean {
    // check full oscillation
    const firstHalf = this.halfPeriodProvider.getNext();
    const secondHalf = this.halfPeriodProvider.getNext();

    if (firstHalf === undefined || secondHalf === undefined) {
      return false;
    }
    if (isNot((firstHalf + secondHalf) / 2, delimiter)) {
      return false;
    }

    return true;
  }

  private readBit(): boolean | undefined {
    // check full oscillation
    const firstHalf = this.halfPeriodProvider.getNext();
    const secondHalf = this.halfPeriodProvider.getNext();
    if (firstHalf === undefined || secondHalf === undefined) {
      return undefined;
    }
    const isOne = is((firstHalf + secondHalf) / 2, one);
    const isZero = is((firstHalf + secondHalf) / 2, zero);

    if (!isOne && !isZero) {
      return undefined;
    }

    return isOne;
  }

  private readByte(): number {
    const delimiter = this.readDelimiter();
    if (!delimiter) {
      throw new DecodingError(`${formatPosition(this)} Unable to find delimiter.`);
    }
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new DecodingError(`${formatPosition(this)} Unable to detect bit.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    return byte;
  }
}

function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}
