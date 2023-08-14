import {BufferAccess} from 'retroload-common';
import {WaveDecoder} from '../decoder/WaveDecoder.js';
import {type HalfPeriodProvider, SampleToHalfPeriodConverter} from '../decoder/SampleToHalfPeriodConverter.js';
import {Logger} from '../Logger.js';
import {calculateChecksum8, hex8} from '../Utils.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from './ConverterManager.js';
import {BlockStartNotFound, DecodingError, EndOfInput} from './ConverterExceptions.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

type FrequencyRange = [number, number];

const one: FrequencyRange = [770, 1300];
const delimiter: FrequencyRange = [500, 670];
const zero: FrequencyRange = [1400, 2800];
const minIntroPeriods = 50;

function convert(ba: BufferAccess, settings: ConverterSettings): OutputFile[] {
  const sampleProvider = new WaveDecoder(ba);
  const halfPeriodProvider = new SampleToHalfPeriodConverter(sampleProvider);
  const hpp = new HalfPeriodProcessor(halfPeriodProvider, settings);
  let block: BufferAccess | undefined;
  let previousBlockNumber: number | undefined;
  const files: OutputFile[] = [];
  let blocks: BufferAccess[] = [];
  do {
    try {
      block = hpp.decodeBlock();
    } catch (e) {
      if (e instanceof DecodingError) {
        if (settings.onError === 'zerofill') {
          block = BufferAccess.create(129);
        }
      } else {
        throw e;
      }
    }
    const blockNumber = block?.getUint8(0);
    let nextFileDetected = false;
    if (blockNumber !== undefined && previousBlockNumber !== undefined) {
      if (blockNumber <= previousBlockNumber) {
        nextFileDetected = true;
        if (blockNumber !== 0 && blockNumber !== 1) {
          Logger.info(`Warning: Got first block with block number ${hex8(blockNumber)}`);
        }
      } else if (blockNumber > previousBlockNumber + 1 && blockNumber !== 0xff) {
        Logger.info(`Warning: Missing block. Got block number ${hex8(blockNumber)} but expected was ${hex8(previousBlockNumber + 1)}.`);
      }
    }
    if (nextFileDetected || (block === undefined && blocks.length > 0)) {
      files.push(bufferAccessListToOutputFile(blocks));
      // begin of a new file
      blocks = (block === undefined) ? [] : [block];
    } else if (block !== undefined) {
      blocks.push(block);
    }
    previousBlockNumber = blockNumber;
  } while (block !== undefined);

  return files;
}

class HalfPeriodProcessor {
  private readonly halfPeriodProvider: HalfPeriodProvider;
  private readonly settings: ConverterSettings;
  constructor(halfPeriodProvider: HalfPeriodProvider, settings: ConverterSettings) {
    this.halfPeriodProvider = halfPeriodProvider;
    this.settings = settings;
  }

  decodeBlock(): BufferAccess | undefined {
    let keepGoing = true;
    do {
      try {
        const blockWrapper = this.decodeBlockImpl();
        console.log(blockWrapper);
        if (blockWrapper.status === BlockStatus.Complete) {
          return blockWrapper.data;
        }
        // invalid blocks (partial / invalid checksum):
        if (this.settings.onError === 'partial') {
          return blockWrapper.data;
        }
        if (['stop', 'skipfile', 'zerofill'].includes(this.settings.onError)) {
          throw new DecodingError('Unable to decode block.');
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

    return undefined;
  }

  decodeBlockImpl(): BlockWrapper {
    if (!this.findValidIntro()) {
      throw new EndOfInput();
    }
    Logger.info(`${this.getFormattedPosition()} Reading block...`);
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
          return new BlockWrapper(block.slice(0, 129), BlockStatus.Partial);
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
    Logger.debug(`${this.getFormattedPosition()} Finished reading block number 0x${blockNumber.toString(16).padStart(2, '0')}`);

    // return slice with block number, but not checksum
    return new BlockWrapper(block.slice(0, 129), checksumCorrect ? BlockStatus.Complete : BlockStatus.InvalidChecksum);
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
      throw new DecodingError(`${this.getFormattedPosition()} Did not found a delimiter at half period.`);
    }
    let byte = 0;
    for (let i = 0; i < 8; i++) {
      const bit = this.readBit();
      if (bit === undefined) {
        throw new DecodingError(`${this.getFormattedPosition()} Unable to detect bit at half period.`);
      }
      byte |= ((bit ? 1 : 0) << i);
    }

    return byte;
  }

  private getFormattedPosition(): string {
    const timestamp = secondsToTimestamp(this.halfPeriodProvider.getCurrentPositionSecond());
    const samples = this.halfPeriodProvider.getCurrentPositionSample();
    return `${timestamp} sample ${samples}`;
  }
}

function is(value: number, range: FrequencyRange): boolean {
  return value >= range[0] && value <= range[1];
}

function isNot(value: number, range: FrequencyRange): boolean {
  return value < range[0] || value > range[1];
}

function secondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600).toString(10).padStart(2, '0');
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60).toString(10).padStart(2, '0');
  const seconds = (totalSeconds % 60).toFixed(4).padStart(7, '0');

  return `${hours}:${minutes}:${seconds}`;
}

function bufferAccessListToOutputFile(blocks: BufferAccess[]): OutputFile {
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of blocks) {
    data.writeBa(block);
  }
  const filename = data.slice(0x14, 8).asAsciiString().trim();
  const proposedName = `${restrictCharacters(filename)}.tap`;

  return {proposedName, data};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}

class BlockWrapper {
  constructor(
    readonly data: BufferAccess,
    readonly status: BlockStatus,
  ) {}
}

enum BlockStatus {
  /**
   * A complete block has successfully been read.
   */
  Complete,
  /**
   * A complete block has been read, but it's checksum was incorrect.
   */
  InvalidChecksum,
  /**
   * Reading of a block was partial because of an encoding error.
   */
  Partial,
}
