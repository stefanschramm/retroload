import {AbstractEncoder} from './AbstractEncoder.js';
import {BufferAccess} from '../BufferAccess.js';

const fZero = 1200;
const fOne = 2400;
export const maxFileNameLength = 6;

/**
 * Encoder for TA alphatronic PC
 *
 * It uses Kansas City Standard.
 *
 * TODO: Generalize? Is the way of writing the header with file name the same on all KCS compatible systems?
 */
export class TaEncoder extends AbstractEncoder {
  static getTargetName() {
    return 'ta';
  }

  begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordFile(filename: string, dataBa: BufferAccess) {
    const headerBa = BufferAccess.create(16);
    headerBa.writeAsciiString('', 10, 0xd3);
    headerBa.writeAsciiString(filename, maxFileNameLength, 0);

    this.recordOscillations(fOne, 500);
    this.recordBytes(headerBa);
    this.recordOscillations(fOne, 500);
    this.recordBytes(dataBa);
    this.recordOscillations(fOne, 500);
  }

  recordByte(byte) {
    this.recordBit(0); // start bit
    super.recordByte(byte);
    this.recordBit(1); // stop bits
    this.recordBit(1);
  }

  recordBit(value) {
    if (value) {
      this.recordOscillations(fOne, 2);
    } else {
      this.recordOscillations(fZero, 1);
    }
  }
}
