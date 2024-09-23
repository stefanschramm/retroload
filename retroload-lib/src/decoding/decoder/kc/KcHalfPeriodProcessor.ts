import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8, hex8} from '../../../common/Utils.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {formatPosition} from '../../../common/Positioning.js';
import {type FrequencyRange, isNot, avg, bitByFrequency} from '../../Frequency.js';
import {type KcBlockProvider} from './KcBlockProvider.js';
import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';
import {DynamicSyncFinder} from '../../DynamicSyncFinder.js';

const minIntroPeriods = 200;

/**
 * Decode half periods into blocks.
 */
export class KcHalfPeriodProcessor implements KcBlockProvider {
  private readonly syncFinder: DynamicSyncFinder;

  private fOne: FrequencyRange = [0, 0];
  private fZero: FrequencyRange = [0, 0];
  private fDelimiter: FrequencyRange = [0, 0];

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new DynamicSyncFinder(this.halfPeriodProvider, minIntroPeriods, 0.3);
    this.updateFrequencies(1050.0);
  }

  public * blocks(): Generator<BlockDecodingResult> {
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
    const syncResult = this.syncFinder.findSync();
    if (!syncResult) {
      throw new EndOfInput();
    }
    this.updateFrequencies(syncResult);
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
            block,
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
    Logger.debug(`${formatPosition(blockEnd)} Finished reading block number ${hex8(blockNumber)}`);

    // return slice with block number, but not checksum
    return new BlockDecodingResult(
      block,
      checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
      blockBegin,
      blockEnd,
    );
  }

  private updateFrequencies(fSync: number): void {
    this.fZero = [fSync * 1.5, fSync * 4]; // = 2 * fSync
    this.fOne = [fSync * 0.75, fSync * 1.5]; // = fSync
    this.fDelimiter = [fSync * 0.25, fSync * 0.75]; // 0.5 * fSync
  }

  private readDelimiter(): void {
    // check full oscillation
    const oscillationValue = avg(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext());
    if (oscillationValue === undefined || isNot(oscillationValue, this.fDelimiter)) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to find delimiter. Read: ${oscillationValue} Hz Expected: ${this.fDelimiter[0]} Hz - ${this.fDelimiter[1]}.`);
    }
  }

  private readBit(): boolean {
    // check full oscillation
    const oscillationValue = avg(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext());
    const isOne = bitByFrequency(oscillationValue, this.fZero, this.fOne);

    if (isOne === undefined) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit. Read: ${oscillationValue} Hz Expected: ${this.fOne[0]} Hz - ${this.fOne[1]} Hz or ${this.fZero[0]} Hz - ${this.fZero[1]} Hz.`);
    }

    return isOne;
  }

  private readByte(): number {
    this.readDelimiter();
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      byte |= ((this.readBit() ? 1 : 0) << i);
    }

    return byte;
  }
}
