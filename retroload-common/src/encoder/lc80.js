import {BufferAccess} from '../buffer_access.js';
import {BaseEncoder} from './base.js';

const fShort = 2000;
const fLong = 1000;
const fSyncIntro = 1000;
const syncIntroLength = 4; // s
const fSyncMid = 2000;
const syncMidLength = 2; // s
const fSyncEnd = 2000;
const syncEndLength = 2; // s

/**
 * Encoder for LC 80
 *
 * Format description: Bedienungsanleitung LC 80, p. 24-25
 */
export class Lc80Encoder extends BaseEncoder {
  static getTargetName() {
    return 'lc80';
  }

  begin() {
    super.begin();
    this.recordSeconds(fSyncIntro, syncIntroLength);
  }

  recordHeader(fileNumber, startAddress, endAddress) {
    // The "file name" gets written to the tape in reverse order.
    // So it's rather a little-endian file number than a name.
    const headerBa = BufferAccess.create(6);
    headerBa.writeUInt16LE(fileNumber);
    headerBa.writeUInt16LE(startAddress);
    headerBa.writeUInt16LE(endAddress);
    this.recordBytes(headerBa);
  }

  recordData(data) {
    const checkSum = this.calculateChecksum(data);
    this.recordByte(checkSum);
    this.recordSeconds(fSyncMid, syncMidLength);
    for (let i = 0; i < data.length(); i++) {
      this.recordByte(data.getUint8(i));
    }
  }

  end() {
    this.recordSeconds(fSyncEnd, syncEndLength);
    super.end();
  }

  recordByte(byte) {
    this.recordBit(0);
    super.recordByte(byte);
    this.recordBit(1);
  }

  recordBit(value) {
    if (value) {
      this.recordOscillations(fShort, 6);
      this.recordOscillations(fLong, 6);
    } else {
      this.recordOscillations(fShort, 12);
      this.recordOscillations(fLong, 3);
    }
  }

  calculateChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length(); i++) {
      sum += data.getUint8(i);
    }

    return sum & 0xff;
  }
}
