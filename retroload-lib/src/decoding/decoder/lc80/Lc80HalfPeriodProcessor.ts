import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {type FrequencyRange, is} from '../../Frequency.js';
import {type Position, formatPosition} from '../../../common/Positioning.js';
import {calculateChecksum8, hex16} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {SyncFinder} from '../../SyncFinder.js';

const fShort: FrequencyRange = [1300, 2300];
const fLong: FrequencyRange = [600, 1300];
const fSyncIntro = fLong;
const fSyncMid = fShort;
const minIntroSyncPeriods = 200;
const minMidSyncPeriods = 10;

/**
 * Decode half periods
 */
export class Lc80HalfPeriodProcessor {
  private readonly introSyncFinder: SyncFinder;
  private readonly midSyncFinder: SyncFinder;

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.introSyncFinder = new SyncFinder(this.halfPeriodProvider, fSyncIntro, minIntroSyncPeriods);
    this.midSyncFinder = new SyncFinder(this.halfPeriodProvider, fSyncMid, minMidSyncPeriods);
  }

  public *files(): Generator<FileDecodingResult> {
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
    if (!this.introSyncFinder.findSync()) {
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

    if (!this.midSyncFinder.findSync()) {
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

    // Files from real LC 80 seem to have one long half period here that needs to be skipped.
    // Retroload currently does not generate this but generated WAVs are readable by LC 80.
    this.halfPeriodProvider.getNext();

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

  private readBit(): boolean | undefined {
    // 0 bit: 12 * short + 3 * long
    // 1 bit: 6 * short + 6 * long

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading short half periods...`);
    if (!this.readShortHalfPeriods()) {
      return undefined;
    }

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading three long oscillations...`);
    if (!this.readOscillations(fLong, 3)) {
      return undefined;
    }

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading determining oscillation...`);
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
      // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading two long oscillations...`);
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

  private readShortHalfPeriods(): boolean {
    let halfPeriod: number | undefined;
    do {
      halfPeriod = this.halfPeriodProvider.getNext();
      if (halfPeriod === undefined) {
        return false;
      }
    } while (is(halfPeriod, fShort));

    this.halfPeriodProvider.rewindOne();

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
    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading start bit...`);
    const startBit = this.readBit();
    if (startBit !== false) {
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

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Reading stop bit...`);
    const stopBit = this.readBit();
    if (stopBit !== true) {
      throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect stop bit.`);
    }

    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Read byte: ${hex8(byte)}`);

    return byte;
  }
}

export class FileDecodingResult {
  public constructor(
    public readonly data: BufferAccess,
    public readonly status: FileDecodingResultStatus,
    public readonly begin: Position,
    public readonly end: Position,
    public readonly fileNumber: number,
    public readonly startAddress: number,
    public readonly endAddress: number,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
