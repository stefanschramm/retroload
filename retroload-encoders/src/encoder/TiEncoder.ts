import {AbstractEncoder} from './AbstractEncoder.js';
import {type BufferAccess} from 'retroload-common';
import {InputDataError} from '../Exceptions.js';
import {Logger} from '../Logger.js';

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
      this.recordByte(calculateChecksum(blockDataBa));
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

function calculateChecksum(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum += data.getUint8(i);
  }

  return sum & 0xff;
}
