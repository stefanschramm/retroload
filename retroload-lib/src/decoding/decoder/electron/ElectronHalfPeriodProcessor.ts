import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {formatPosition} from '../../../common/Positioning.js';
import {type FrequencyRange, avg, bitByFrequency} from '../../Frequency.js';
import {type ElectronBlockProvider} from './ElectronBlockProvider.js';
import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';
import {DynamicSyncFinder} from '../../DynamicSyncFinder.js';
import {calculateCrc16Xmodem, hex16, hex8} from '../../../common/Utils.js';

const minIntroPeriods = 200;

/**
 * Decode half periods into blocks.
 */
export class ElectronHalfPeriodProcessor implements ElectronBlockProvider {
  private readonly syncFinder: DynamicSyncFinder;

  private fOne: FrequencyRange = [0, 0];
  private fZero: FrequencyRange = [0, 0];

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new DynamicSyncFinder(this.halfPeriodProvider, minIntroPeriods, 0.3);
    this.updateFrequencies(2400);
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

  /**
   * https://beebwiki.mdfs.net/Acorn_cassette_format
   */
  private decodeBlock(): BlockDecodingResult {
    const syncResult = this.syncFinder.findSync();
    if (!syncResult) {
      throw new EndOfInput();
    }
    this.updateFrequencies(syncResult);
    const blockBegin = this.halfPeriodProvider.getPosition();
    Logger.debug(`${formatPosition(blockBegin)} Reading block...`);

    // Read until no more bytes can be read
    const buffer = BufferAccess.create(0xffff); // actually 256 should be enough :)
    let bytesRead = 0;
    for (let i = 0; i < 0xffff; i++) {
      try {
        const byte = this.readByte();
        buffer.writeUint8(byte);
        bytesRead++;
      } catch (e) {
        if (e instanceof DecodingError) {
          if (i === 0) {
            throw new BlockStartNotFound();
          }
          break;
        }
        throw e; // unknown exception
      }
    }

    const blockEnd = this.halfPeriodProvider.getPosition();
    const block = buffer.slice(0, bytesRead);
    let resultStatus = BlockDecodingResultStatus.Partial;
    const syncByte = block.getUint8(0);
    if (syncByte === 0x2a) {
      // Normal data block

      let filename = '';
      for (let i = 1; i < block.length(); i++) {
        const c = block.getUint8(i);
        if (c === 0) {
          break;
        }
        filename += String.fromCharCode(c);
      }

      const headerInfoOffset = filename.length + 2;

      const headerBlock = buffer.slice(1, headerInfoOffset + 16); // does not include checksum
      const blockNumber = buffer.getUint16Le(headerInfoOffset + 8);
      const readHeaderChecksum = buffer.getUint16Be(headerInfoOffset + 17);
      const calculatedHeaderChecksum = calculateCrc16Xmodem(headerBlock);
      const headerChecksumCorrect = calculatedHeaderChecksum === readHeaderChecksum;

      Logger.info(`${formatPosition(blockBegin)} File: ${filename}, Block: ${hex8(blockNumber)}`);

      if (!headerChecksumCorrect) {
        Logger.error(`${formatPosition(blockEnd)} Warning: Invalid checksum for header of block ${hex8(blockNumber)}! Read checksum: ${hex16(readHeaderChecksum)}, Calculated checksum: ${hex16(calculatedHeaderChecksum)}.`);
      }

      // further available (here unused) fields in header: loadAddress, execAddress, flag, nextFileAddress

      const dataBlockLength = buffer.getUint16Le(headerInfoOffset + 10);
      const dataBlock = buffer.slice(headerInfoOffset + 19, dataBlockLength);
      const readDataChecksum = buffer.getUint16Be(headerInfoOffset + 19 + dataBlockLength);
      const calculatedDataChecksum = calculateCrc16Xmodem(dataBlock);
      const dataChecksumCorrect = calculatedDataChecksum === readDataChecksum;
      if (!dataChecksumCorrect) {
        Logger.error(`${formatPosition(blockEnd)} Warning: Invalid checksum for data of block ${hex8(blockNumber)}! Read checksum: ${hex16(readDataChecksum)}, Calculated checksum: ${hex16(calculatedDataChecksum)}.`);
      }

      resultStatus = (!headerChecksumCorrect || !dataChecksumCorrect)
        ? BlockDecodingResultStatus.Complete
        : BlockDecodingResultStatus.InvalidChecksum;
    } else if (syncByte === 0xff) {
      // End of file block(?)
      resultStatus = BlockDecodingResultStatus.Complete;
    }
    Logger.debug(`${formatPosition(blockEnd)} Finished reading block.`);

    return new BlockDecodingResult(
      block,
      resultStatus,
      blockBegin,
      blockEnd,
    );
  }

  private updateFrequencies(fSync: number): void {
    // fSync: 2400 Hz
    this.fOne = [fSync * 0.75, fSync * 1.5]; // = fSync
    this.fZero = [fSync * 0.25, fSync * 0.75]; // 0.5 * fSync
  }

  private readBit(): boolean {
    // check full oscillation
    const oscillationValue = avg(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext());
    const isOne = bitByFrequency(oscillationValue, this.fZero, this.fOne);

    if (isOne === undefined) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit. Read: ${oscillationValue} Hz Expected: ${this.fOne[0]} Hz - ${this.fOne[1]} Hz or ${this.fZero[0]} Hz - ${this.fZero[1]} Hz.`);
    }

    if (isOne) {
      const oscillationValue = avg(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext());
      const isOne = bitByFrequency(oscillationValue, this.fZero, this.fOne);
      if (!isOne) {
        throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit. Second oscillation of 1 bit was of ${oscillationValue} Hz Expected: ${this.fOne[0]} Hz - ${this.fOne[1]} Hz.`);
      }
    }

    return isOne;
  }

  private readByte(): number {
    // TODO: start bit: 0
    const startBit = this.readBit();
    if (startBit) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect start bit. Expected 0 but got 1.`);
    }

    let byte = 0;
    for (let i = 0; i < 8; i++) {
      byte |= ((this.readBit() ? 1 : 0) << i);
    }

    const stopBit = this.readBit();
    if (!stopBit) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect stop bit. Expected 1 but got 0.`);
    }

    return byte;
  }
}
