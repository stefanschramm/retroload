import {type ByteRecorder, recordByteMsbFirst, recordBytes} from '../ByteRecorder.js';
import {calculateCrc16Ccitt, hex16} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InternalError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

const fZero = 2000;
const fOne = 1000;

/**
 * Block size excluding checksum bytes
 */
export const blockSize = 256;

/**
 * Encoder for IBM PC 5150 cassette routines
 *
 * Format description: IBM 5150 Technical Reference 6025008, chapter 3-8
 */
export class Ibm5150Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordSyncSequence(): void {
    for (let i = 0; i < 256; i++) {
      this.recordByte(0xff); // leader bytes
    }
    this.recordBit(0); // sync bit
    this.recordByte(0x16); // sync byte
  }

  public recordBlock(data: BufferAccess): void {
    if (data.length() !== blockSize) {
      throw new InternalError(`Encountered block of ${data.length()} bytes. Expected was ${blockSize}.`);
    }

    const checksum = calculateCrc16Ccitt(data);
    Logger.debug(`Checksum: ${hex16(checksum)}`);

    const fullBlock = BufferAccess.create(blockSize + 2);
    fullBlock.writeBa(data);
    fullBlock.writeUint16Be(checksum);

    Logger.debug(fullBlock.asHexDump());

    recordBytes(this, fullBlock);
  }

  public recordEndOfDataSequence(): void {
    // "After the last data block, a trailer consisting of four bytes of all one bits will be written." [1]
    for (let i = 0; i < 4; i++) {
      this.recordByte(0xff);
    }
  }

  /**
   * Pause to insert between BASIC header block and successive data blocks
   */
  public recordGap(): void {
    this.oscillator.recordSilenceMs(500);
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    this.oscillator.recordOscillations(value ? fOne : fZero, 1);
  }
}
