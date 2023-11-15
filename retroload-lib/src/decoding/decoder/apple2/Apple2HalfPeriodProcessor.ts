import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {formatPosition} from '../../../common/Positioning.js';
import {type FrequencyRange, is, avg, bitByFrequency} from '../../Frequency.js';
import {calculateChecksum8Xor, hex8} from '../../../common/Utils.js';
import {SyncFinder} from '../../SyncFinder.js';
import {FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';

const fSyncIntro: FrequencyRange = [680, 930]; // 770 Hz
// const fSyncEndFirstHalf: FrequencyRange = [1700, 2100]; // 2000 Hz
// const fSyncEndSecondHalf: FrequencyRange = [2400, 2800]; // 2500 Hz
const fSyncEndFirstHalf: FrequencyRange = [1700, 2800]; // 2000 Hz
const fSyncEndSecondHalf = fSyncEndFirstHalf;
const fZero: FrequencyRange = [1500, 2950]; // 2000 Hz
const fOne: FrequencyRange = [850, 1200]; // 1000 Hz
const minIntroSyncPeriods = 200;

export class Apple2HalfPeriodProcessor {
  private readonly syncFinder: SyncFinder;
  constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new SyncFinder(this.halfPeriodProvider, fSyncIntro, minIntroSyncPeriods);
  }

  * files(): Generator<FileDecodingResult> {
    let keepGoing = true;
    do {
      try {
        const decodedFile = this.decodeRecord();
        if (decodedFile.status === FileDecodingResultStatus.Success && decodedFile.blocks[0].data.length() === 2) {
          const length = decodedFile.blocks[0].data.getUint16Le(0);
          Logger.info(`Found a 2-byte long record that is probably a header for a basic record. Not outputting it. Recorded length value was: ${length}`);
          continue;
        }
        yield decodedFile;
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

  private decodeRecord(): FileDecodingResult {
    do {
      if (!(this.syncFinder.findSync())) {
        throw new EndOfInput();
      }
    } while (!this.readSyncEndMarker());

    const recordBegin = this.halfPeriodProvider.getPosition();

    // read data
    const bytesRead = [];
    for (let i = 0; i < 2 ** 16; i++) {
      const byte = this.readByte();
      if (byte === undefined) {
        break;
      }
      bytesRead.push(byte);
    }

    const recordEnd = this.halfPeriodProvider.getPosition();

    const readChecksum = bytesRead.pop();
    if (readChecksum === undefined) {
      throw new EndOfInput();
    }
    const dataBa = BufferAccess.createFromUint8Array(new Uint8Array(bytesRead));
    const calculatedChecksum = calculateChecksum8Xor(dataBa, 0xff);
    const checksumCorrect = calculatedChecksum === readChecksum;

    if (!checksumCorrect) {
      Logger.error(`${formatPosition(recordEnd)} Warning: Invalid checksum! Read checksum: ${hex8(readChecksum)}, Calculated checksum: ${hex8(calculatedChecksum)}.`);
    }

    return new FileDecodingResult(
      [
        // Files are not made out of blocks. Just dummy-wrapping it.
        new BlockDecodingResult(
          dataBa,
          checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
          recordBegin,
          recordEnd,
        ),
      ],
      checksumCorrect ? FileDecodingResultStatus.Success : FileDecodingResultStatus.Error,
      recordBegin,
      recordEnd,
    );
  }

  private readSyncEndMarker(): boolean {
    const firstHalf = this.halfPeriodProvider.getNext();
    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Sync end firstHalf: ${firstHalf ?? ''}...`);
    if (firstHalf === undefined || !is(firstHalf, fSyncEndFirstHalf)) {
      return false;
    }

    const secondHalf = this.halfPeriodProvider.getNext();
    // Logger.debug(`${formatPosition(this.halfPeriodProvider.getPosition())} Sync end secondHalf: ${secondHalf ?? ''}...`);
    if (secondHalf === undefined || !is(secondHalf, fSyncEndSecondHalf)) {
      return false;
    }

    return true;
  }

  private readByte(): number | undefined {
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        if (i === 0) {
          // At the beginning of a byte this is expected and means there are no more bytes to read.
          return undefined;
        }
        // Within a byte seems to be a real decoding error.
        throw new DecodingError(`${formatPosition(this.halfPeriodProvider.getPosition())} Unable to detect bit.`);
      }
      byte |= ((bit ? 1 : 0) << (7 - i)); // most significant bit arrives first
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
