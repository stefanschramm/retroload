import {AbstractEncoder} from './AbstractEncoder.js';
import {BufferAccess} from '../BufferAccess.js';

const blockDataSize = 32;

/**
 * Encoder for Robotron Z 1013
 *
 * https://hc-ddr.hucki.net/wiki/doku.php/z1013/kassettenformate
 */
export class Z1013Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'z1013';
  }

  override begin() {
    super.begin();
    this.recordFirstIntro();
  }

  recordData(ba: BufferAccess) {
    const blocks = Math.ceil(ba.length() / blockDataSize);

    // blocks
    for (let i = 0; i < blocks; i++) {
      const offset = i * blockDataSize;
      this.recordBlock(i, ba.slice(offset, blockDataSize));
    }
  }

  recordBlock(blockNumber: number, blockDataBa: BufferAccess) {
    const blockBa = BufferAccess.create(2 + blockDataBa.length() + 2);
    blockBa.writeUint16Le(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.writeUint16Le(calculateChecksum(blockBa.slice(0, blockBa.length() - 2)));

    this.recordIntro();
    this.recordDelimiter();
    this.recordBytes(blockBa);
  }

  recordFirstIntro() {
    this.recordOscillations(640, 2000);
  }

  recordIntro() {
    this.recordOscillations(640, 7);
  }

  recordDelimiter() {
    this.recordOscillations(1280, 1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordHalfOscillation(1280);
    } else {
      this.recordOscillations(2560, 1);
    }
  }
}

function calculateChecksum(ba: BufferAccess) {
  let checkSum = 0;
  for (let i = 0; i < ba.length(); i += 2) {
    const word = ba.getUint16Le(i);
    checkSum = (checkSum + word) & 0xffff;
  }

  return checkSum;
}
