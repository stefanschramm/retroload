import {BaseEncoder} from './base.js';

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

  recordData(dvData) {
    const blocks = Math.ceil(dvData.byteLength / blockDataSize);

    // blocks
    for (let i = 0; i < blocks; i++) {
      const offset = i * blockDataSize;
      this.recordBlock(i, dvData.referencedSlice(offset, blockDataSize));
    }
  }

  recordBlock(blockNumber, dvBlockData) {
    this.recordIntro();
    this.recordDelimiter();
    let checkSum = blockNumber & 0xffff;
    this.recordUint16Le(blockNumber); // block number
    for (let i = 0; i < blockDataSize; i += 2) {
      const word = dvBlockData.getUint16(i, true);
      checkSum = (checkSum + word) & 0xffff;
      this.recordUint16Le(word); // 16 x 16 bit data word
    }
    this.recordUint16Le(checkSum);
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
