import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8, hex8} from '../../../common/Utils.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../ConverterExceptions.js';
import {formatPosition} from '../../../common/Positioning.js';
import {BlockDecodingResult, BlockDecodingResultStatus, type KcBlockProvider} from './KcBlockProvider.js';
import {is, type FrequencyRange, isNot} from '../../Frequency.js';
import {SyncFinder} from '../../SyncFinder.js';

const one: FrequencyRange = [770, 1300];
const delimiter: FrequencyRange = [500, 670];
const zero: FrequencyRange = [1400, 2800];
const minIntroPeriods = 200;

/**
 * Decode half periods into blocks.
 */
export class KcHalfPeriodProcessor implements KcBlockProvider {
  private readonly syncFinder: SyncFinder;
  constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new SyncFinder(this.halfPeriodProvider, one, minIntroPeriods);
  }

  * blocks(): Generator<BlockDecodingResult> {
    let keepGoing = true;
    do {
      try {
        yield this.decodeBlock();
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

  private decodeBlock(): BlockDecodingResult {
    if (!this.syncFinder.findSync()) {
      throw new EndOfInput();
    }
    const blockBegin = this.halfPeriodProvider.getPosition();
    Logger.debug(`${formatPosition(blockBegin)} Reading block...`);
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
            blockBegin,
            this.halfPeriodProvider.getPosition(),
          );
        }
        throw e; // unknown exception
      }
    }

    const blockEnd = this.halfPeriodProvider.getPosition();
    const blockNumber = block.getUint8(0);
    const calculatedChecksum = calculateChecksum8(block.slice(1, 128));
    const readChecksum = block.getUint8(129);
    const checksumCorrect = calculatedChecksum === readChecksum;
    if (!checksumCorrect) {
      Logger.error(`${formatPosition(blockEnd)} Warning: Invalid checksum for block ${blockNumber}! Read checksum: ${readChecksum}, Calculated checksum: ${calculatedChecksum}.`);
    }
    Logger.debug(`${formatPosition(blockEnd)} Finished reading block number 0x${hex8(blockNumber)}`);

    // return slice with block number, but not checksum
    return new BlockDecodingResult(
      block.slice(0, 129),
      checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
      blockBegin,
      blockEnd,
    );
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
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to find delimiter.`);
    }
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    return byte;
  }
}
