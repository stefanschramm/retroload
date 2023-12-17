import {AbstractEncoder} from '../AbstractEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';

const fZero = 1200;
const fOne = 2400;
export const maxFileNameLength = 6;

/**
 * Encoder for TA alphatronic PC
 *
 * TA alphatronic PC Service-Handbuch, p. 58
 * https://oldcomputers-ddns.org/public/pub/rechner/ta/alphatronic_pc-8/manual/ta_pc8_service_handbuch_(bw_ocr).pdf
 */
export class TaEncoder extends AbstractEncoder {
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

  override recordByte(byte: number) {
    this.recordBit(0); // start bit
    super.recordByte(byte);
    this.recordBit(1); // stop bits
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne, 2);
    } else {
      this.recordOscillations(fZero, 1);
    }
  }
}
