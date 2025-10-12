import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from '../../DecoderExceptions.js';
import {type FrequencyRange, bitByFrequency, oscillationIs} from '../../Frequency.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {SyncFinder} from '../../SyncFinder.js';
import {type Z1013BlockProvider} from './Z1013BlockProvider.js';
import {calculateChecksum16Le} from '../../../common/Utils.js';
import {formatPosition} from '../../../common/Positioning.js';

const fOne: FrequencyRange = [1000, 1500];
const fZero: FrequencyRange = [2200, 2800];
const fSync: FrequencyRange = [300, 900];
const minIntroSyncPeriods = 5;
const rawBlockLength = 2 + 32 + 2;

export class Z1013HalfPeriodProcessor implements Z1013BlockProvider {
  private readonly syncFinder: SyncFinder;

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.syncFinder = new SyncFinder(this.halfPeriodProvider, fSync, minIntroSyncPeriods);
  }

  public *blocks(): Generator<BlockDecodingResult> {
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

  private decodeFile(): BlockDecodingResult {
    if (!this.syncFinder.findSync()) {
      throw new EndOfInput();
    }

    const blockBa = BufferAccess.create(rawBlockLength);
    const fileBegin = this.halfPeriodProvider.getPosition();
    if (!oscillationIs(this.halfPeriodProvider.getNext(), this.halfPeriodProvider.getNext(), fOne)) {
      throw new BlockStartNotFound();
    }
    for (let i = 0; i < rawBlockLength; i++) {
      blockBa.writeUint8(this.readByte());
    }
    const fileEnd = this.halfPeriodProvider.getPosition();

    const readChecksum = blockBa.getUint16Le(34);
    const calculatedChecksum = calculateChecksum16Le(blockBa.slice(0, blockBa.length() - 2));
    const checksumCorrect = calculatedChecksum === readChecksum;
    if (!checksumCorrect) {
      Logger.error(`${formatPosition(fileEnd)} Warning: Invalid checksum! Read checksum: ${readChecksum}, Calculated checksum: ${calculatedChecksum}.`);
    }

    return new BlockDecodingResult(
      blockBa,
      checksumCorrect ? BlockDecodingResultStatus.Complete : BlockDecodingResultStatus.InvalidChecksum,
      fileBegin,
      fileEnd,
    );
  }

  private readByte(): number {
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

  private readBit(): boolean | undefined {
    const halfPeriod = this.halfPeriodProvider.getNext();
    const bitValue = bitByFrequency(halfPeriod, fZero, fOne);
    if (bitValue === undefined) {
      return undefined;
    }
    if (bitValue) {
      // one bit consists of only one half period
      return true;
    }
    // zero - read next half period
    if (bitByFrequency(this.halfPeriodProvider.getNext(), fZero, fOne) !== false) {
      return undefined; // next half period doesn't match
    }

    return false;
  }
}
