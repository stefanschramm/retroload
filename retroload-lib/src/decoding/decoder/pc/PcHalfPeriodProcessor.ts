import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {type FrequencyRange, avg, bitByFrequency} from '../../Frequency.js';
import {type Position, formatPosition} from '../../../common/Positioning.js';
import {calculateCrc16Ccitt, hex16} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {SyncFinder} from '../../SyncFinder.js';

const fZero: FrequencyRange = [1600, 2400]; // 2000 Hz
const fOne: FrequencyRange = [800, 1200]; // 1000 Hz
const fSync = fOne;
const minIntroSyncPeriods = 200;

export class PcHalfPeriodProcessor {
  private readonly syncFinder: SyncFinder;

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new SyncFinder(this.halfPeriodProvider, fSync, minIntroSyncPeriods);
  }

  public * blocks(): Generator<PcBlockDecodingResult> {
    let keepGoing = true;
    do {
      try {
        for (const block of this.decodeRecord()) {
          yield block;
        }
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

  private * decodeRecord(): Generator<PcBlockDecodingResult> {
    // The very first block of a file has a sync intro.
    // Bytes of further blocks of the same file are directly following the previous blocks without any marker.
    this.findSync();
    let hadIntro = true;
    do {
      try {
        const block = this.readBlock(hadIntro);
        if (block === undefined) {
          throw new EndOfInput();
        }
        yield block;
      } catch (e) {
        if (e instanceof DecodingError) {
          // It is expected that we run into encoding errors because we don't know when to stop decoding.
          // Start again with find sync
          return;
        }
      }
      hadIntro = false;
    } while (true);
  }

  private findSync(): void {
    if (!(this.syncFinder.findSync())) {
      throw new EndOfInput();
    }
    const syncBit = this.readBit();
    if (syncBit !== false) {
      throw new BlockStartNotFound();
    }
    const syncByte = this.readByte();
    if (syncByte === undefined || syncByte !== 0x16) {
      throw new BlockStartNotFound();
    }
  }

  private readBlock(hadIntro: boolean): PcBlockDecodingResult | undefined {
    const blockBegin = this.halfPeriodProvider.getPosition();

    // 256 data bytes + 2 bytes for checksum
    const blockBa = BufferAccess.create(256 + 2);
    for (let i = 0; i < 256 + 2; i++) {
      const byte = this.readByte();
      if (byte === undefined) {
        return undefined;
      }
      blockBa.writeUint8(byte);
    }

    const readChecksum = blockBa.getUint16Le(0x100);
    const calculatedChecksum = calculateCrc16Ccitt(blockBa);
    const checksumCorrect = calculatedChecksum === readChecksum;
    if (!checksumCorrect) {
      Logger.error(`${formatPosition(this.halfPeriodProvider.getPosition())} Warning: Invalid checksum! Read checksum: ${hex16(readChecksum)}, Calculated checksum: ${hex16(calculatedChecksum)}.`);
    }

    return new PcBlockDecodingResult(
      blockBa,
      checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
      blockBegin,
      this.halfPeriodProvider.getPosition(),
      hadIntro,
    );
  }

  private readByte(): number | undefined {
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit.`);
      }
      byte |= ((bit ? 1 : 0) << (7 - i));
    }

    return byte;
  }

  private readBit(): boolean | undefined {
    const oscillationValue = avg(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext());
    const isOne = bitByFrequency(oscillationValue, fZero, fOne);
    if (isOne === undefined) {
      Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to determine bit value. Frequency of oscillation was ${oscillationValue} Hz.`);
      return undefined;
    }

    return isOne;
  }
}

export class PcBlockDecodingResult extends BlockDecodingResult {
  public constructor(
    data: BufferAccess,
    status: BlockDecodingResultStatus,
    begin: Position,
    end: Position,
    public readonly hadIntro: boolean,
  ) {
    super(data, status, begin, end);
  }
}
