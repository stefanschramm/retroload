import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8} from '../../../common/Utils.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {Oscillator} from '../Oscillator.js';
import {type ByteRecorder, recordByteMsbFirst, recordBytes} from '../ByteRecorder.js';

const fZero = 689.5;
const fOne = 1379;

/**
 * Encoder for TI-99/4A
 *
 * https://www.unige.ch/medecine/nouspikel/ti99/cassette.htm
 */
export class TiEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordHeader(numberOfRecords: number): void {
    this.recorder.beginAnnotation('Header');
    for (let i = 0; i < 768; i++) {
      this.recordByte(0x00);
    }
    this.recordByte(0xff); // data mark
    this.recordByte(numberOfRecords);
    this.recordByte(numberOfRecords); // repeated
    this.recorder.endAnnotation();
  }

  public recordBlock(blockDataBa: BufferAccess): void {
    if (blockDataBa.length() !== 64) {
      throw new InputDataError('Block needs to be 64 bytes');
    }
    Logger.debug('TiEncoder - recordBlock()');
    Logger.debug(blockDataBa.asHexDump());
    const checksum = calculateChecksum8(blockDataBa);
    // every block is written twice
    for (let i = 0; i < 2; i++) {
      this.recorder.beginAnnotation(i === 0 ? 'Data' : 'Data repeated');
      for (let j = 0; j < 8; j++) {
        this.recordByte(0x00);
      }
      this.recordByte(0xff); // data mark
      recordBytes(this, blockDataBa);
      this.recordByte(checksum);
      this.recorder.endAnnotation();
    }
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fOne, 1);
    } else {
      this.oscillator.recordHalfOscillation(fZero);
    }
  }
}
