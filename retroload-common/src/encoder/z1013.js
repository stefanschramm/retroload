import {BaseEncoder} from './base.js';
import {BufferAccess} from '../buffer_access.js';

const blockDataSize = 32;

/**
 * Encoder for Robotron Z 1013
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'z1013';
  }

  begin() {
    super.begin();
    this.recordFirstIntro();
  }

  recordData(ba) {
    const blocks = Math.ceil(ba.length() / blockDataSize);

    // blocks
    for (let i = 0; i < blocks; i++) {
      const offset = i * blockDataSize;
      this.recordBlock(i, ba.slice(offset, blockDataSize));
    }
  }

  recordBlock(blockNumber, blockDataBa) {
    const blockBa = BufferAccess.create(2 + blockDataBa.length() + 2);
    blockBa.writeUInt16LE(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.writeUInt16LE(calculateChecksum(blockBa.slice(0, blockBa.length() - 2)));

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

  recordBit(value) {
    if (value) {
      this.recordHalfOscillation(1280);
    } else {
      this.recordOscillations(2560, 1);
    }
  }
}

function calculateChecksum(ba) {
  let checkSum = 0;
  for (let i = 0; i < ba.length(); i += 2) {
    const word = ba.getUint16LE(i);
    checkSum = (checkSum + word) & 0xffff;
  }

  return checkSum;
}
