import {AbstractEncoder} from './AbstractEncoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {InputDataError} from '../../common/Exceptions.js';
import {Logger} from '../../common/logging/Logger.js';
import {calculateChecksum8} from '../../common/Utils.js';

const fZero = 689.5;
const fOne = 1379;

/**
 * Encoder for TI-99/4A
 *
 * https://www.unige.ch/medecine/nouspikel/ti99/cassette.htm
 */
export class TiEncoder extends AbstractEncoder {
  static override getTargetName() {
    return 'ti';
  }

  override begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordHeader(numberOfRecords: number) {
    for (let i = 0; i < 768; i++) {
      this.recordByte(0x00);
    }
    this.recordByte(0xff); // data mark
    this.recordByte(numberOfRecords);
    this.recordByte(numberOfRecords); // repeated
  }

  recordBlock(blockDataBa: BufferAccess) {
    if (blockDataBa.length() !== 64) {
      throw new InputDataError('Block needs to be 64 bytes');
    }
    Logger.debug('TiEncoder - recordBlock()');
    Logger.debug(blockDataBa.asHexDump());
    // every block is written twice
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 8; j++) {
        this.recordByte(0x00);
      }
      this.recordByte(0xff); // data mark
      this.recordBytes(blockDataBa);
      this.recordByte(calculateChecksum8(blockDataBa));
    }
  }

  override recordByte(byte: number) {
    this.recordByteMsbFirst(byte);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne, 1);
    } else {
      this.recordHalfOscillation(fZero);
    }
  }
}
