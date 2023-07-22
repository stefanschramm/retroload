import {BufferAccess} from 'retroload-common';
import {AbstractEncoder} from './AbstractEncoder.js';
import {calculateChecksum8} from '../Utils.js';

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
export class Lc80Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'lc80';
  }

  override begin() {
    super.begin();
    this.recordSeconds(fSyncIntro, syncIntroLength);
  }

  recordHeader(fileNumber: number, startAddress: number, endAddress: number) {
    // The "file name" gets written to the tape in reverse order.
    // So it's rather a little-endian file number than a name.
    const headerBa = BufferAccess.create(6);
    headerBa.writeUint16Le(fileNumber);
    headerBa.writeUint16Le(startAddress);
    headerBa.writeUint16Le(endAddress);
    this.recordBytes(headerBa);
  }

  recordData(data: BufferAccess) {
    this.recordByte(calculateChecksum8(data));
    this.recordSeconds(fSyncMid, syncMidLength);
    for (let i = 0; i < data.length(); i++) {
      this.recordByte(data.getUint8(i));
    }
  }

  override end() {
    this.recordSeconds(fSyncEnd, syncEndLength);
    super.end();
  }

  override recordByte(byte: number) {
    this.recordBit(0);
    super.recordByte(byte);
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fShort, 6);
      this.recordOscillations(fLong, 6);
    } else {
      this.recordOscillations(fShort, 12);
      this.recordOscillations(fLong, 3);
    }
  }
}
