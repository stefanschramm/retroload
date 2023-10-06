import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8, hex16} from '../../../common/Utils.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../ConverterExceptions.js';
import {type Position, formatPosition} from '../../../common/Positioning.js';
import {isNot, type FrequencyRange, is} from '../../Frequency.js';

const fShort: FrequencyRange = [1800, 2300];
const fLong: FrequencyRange = [900, 1300];
const fSyncIntro = fLong;
const fSyncMid = fShort;
const minIntroSyncPeriods = 200;
const minMidSyncPeriods = 10;

/**
 * Decode half periods
 */
export class Lc80HalfPeriodProcessor {
  private readonly halfPeriodProvider: HalfPeriodProvider;
  constructor(halfPeriodProvider: HalfPeriodProvider) {
    this.halfPeriodProvider = halfPeriodProvider;
  }

  * files(): Generator<FileDecodingResult> {
    let keepGoing = true;
    do {
      try {
        yield this.decodeFile();
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

  private decodeFile(): FileDecodingResult {
    if (!this.findValidSync(fSyncIntro, minIntroSyncPeriods)) {
      throw new EndOfInput();
    }

    const fileBegin = this.halfPeriodProvider.getPosition();

    // read header
    const fileNumber = this.readByte() | (this.readByte() << 8);
    const startAddress = this.readByte() | (this.readByte() << 8);
    const endAddress = this.readByte() | (this.readByte() << 8);
    const readChecksum = this.readByte();
    const dataLength = endAddress - startAddress;

    Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Read file header - File number: ${hex16(fileNumber)}, Start address: ${hex16(startAddress)}, End address: ${hex16(endAddress)} (== ${dataLength} bytes)`);

    const dataBa = BufferAccess.create(dataLength);

    if (!this.findValidSync(fSyncMid, minMidSyncPeriods)) {
      Logger.error(`${formatPosition(this.halfPeriodProvider.getPosition())} Error: Did not find mid sync.`);
      return new FileDecodingResult(
        dataBa,
        FileDecodingResultStatus.Error,
        fileBegin,
        this.halfPeriodProvider.getPosition(),
        fileNumber,
        startAddress,
        endAddress,
      );
    }

    // read data
    for (let i = 0; i < dataLength; i++) {
      dataBa.writeUint8(this.readByte());
    }

    // We simply ignore the end sync here.

    const fileEnd = this.halfPeriodProvider.getPosition();

    const calculatedChecksum = calculateChecksum8(dataBa);
    const checksumCorrect = calculatedChecksum === readChecksum;
    if (!checksumCorrect) {
      Logger.error(`${formatPosition(fileEnd)} Warning: Invalid checksum for file ${hex16(fileNumber)}! Read checksum: ${readChecksum}, Calculated checksum: ${calculatedChecksum}.`);
    }

    return new FileDecodingResult(
      dataBa,
      checksumCorrect ? FileDecodingResultStatus.Success : FileDecodingResultStatus.Error,
      fileBegin,
      fileEnd,
      fileNumber,
      startAddress,
      endAddress,
    );
  }

  private findValidSync(fSync: FrequencyRange, minPeriods: number): boolean {
    Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Searching for sync...`);
    do {
      if (!this.findSyncStart(fSync)) {
        return false; // end reached
      }
    } while (this.findSyncEnd(fSync) < minPeriods);

    return true;
  }

  private findSyncStart(fSync: FrequencyRange): boolean {
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return false;
      }
    } while (isNot(f, fSync));
    this.halfPeriodProvider.rewindOne();

    return true;
  }

  /**
   * @returns sync length in half periods
   */
  private findSyncEnd(fSync: FrequencyRange): number {
    let syncLength = 0;
    let f;
    do {
      f = this.halfPeriodProvider.getNext();
      if (f === undefined) {
        return syncLength;
      }
      syncLength++;
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} f: ${f}...`);
    } while (is(f, fSync));
    this.halfPeriodProvider.rewindOne();

    Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Sync length: ${syncLength}...`);

    return syncLength;
  }

  private readBit(): boolean | undefined {
    // 0 bit: 12 * short + 3 * long
    // 1 bit: 6 * short + 6 * long

    if (!this.readShortOscillations()) {
      return undefined;
    }

    // One long oscillation was swallowed by readShortOscillations - 2 are left in both cases.
    if (!this.readOscillations(fLong, 2)) {
      return undefined;
    }

    const oscillation = this.readOscillation();
    if (oscillation === undefined) {
      return undefined;
    }
    const isShort = is(oscillation, fShort);
    const isLong = is(oscillation, fLong);
    if (!isShort && !isLong) {
      return undefined;
    }

    const isOneBit = isLong;

    if (isOneBit) {
      if (!this.readOscillations(fLong, 2)) {
        return undefined;
      }
    }
    // else: begin of next bit
    // Actually we should rewind in else-case, but it's not necessary because there should be still enoguh short oscillations for reading the next bit left in input.

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Read ${isOneBit ? '1' : '0'} bit.`);

    return isOneBit;
  }

  private readOscillations(f: FrequencyRange, count: number): boolean {
    for (let i = 0; i < count; i++) {
      const oscillation = this.readOscillation();
      if (oscillation === undefined) {
        return false;
      }
      if (!is(oscillation, f)) {
        return false;
      }
    }

    return true;
  }

  private readShortOscillations(): boolean {
    let oscillation: number | undefined;
    do {
      oscillation = this.readOscillation();
      if (oscillation === undefined) {
        return false;
      }
    } while (is(oscillation, fShort));

    return true;
  }

  private readOscillation(): number | undefined {
    const firstHalf = this.halfPeriodProvider.getNext();
    const secondHalf = this.halfPeriodProvider.getNext();
    if (firstHalf === undefined || secondHalf === undefined) {
      return undefined;
    }

    return (firstHalf + secondHalf) / 2;
  }

  private readByte(): number {
    const startBit = this.readBit();
    if (startBit !== false) {
      console.log(startBit);
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect start bit.`);
    }

    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    const stopBit = this.readBit();
    if (stopBit !== true) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect stop bit.`);
    }

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Read byte: ${hex8(byte)}`);

    return byte;
  }
}

export class FileDecodingResult {
  constructor(
    readonly data: BufferAccess,
    readonly status: FileDecodingResultStatus,
    readonly begin: Position,
    readonly end: Position,
    readonly fileNumber: number,
    readonly startAddress: number,
    readonly endAddress: number,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
