import {BaseEncoder} from './base.js';

const fZero = 1950; // manual: 2400;
const fOne = 1050; // manual: 1200;
const fDelimiter = 557; // manual: 600;

/**
 * 1 byte block number + 128 data bytes.
 * In the recording a block will be of 130 bytes
 * (1 byte block number + 128 data bytes + 1 byte checksum).
 */
const blockSize = 128;
const oscillationsIntro = 400; // fast start for debugging; manual: 8000
const oscillationsBlockIntro = 200; // as in kcemu save_WAV.c; manual: 160

/**
 * Encoder for KC 85/1 (and similar) and KC 85/4 (and similar)
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'kc';
  }

  begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
    this.recordIntro();
  }

  recordBlock(blockNumber, dvBlockData) {
    if (dvBlockData.byteLength > blockSize) {
      throw new Error('Block data exceeds length of 128 bytes');
    }
    this.recordBlockIntro();
    this.recordDelimiter();
    this.recordByte(blockNumber);
    let checkSum = 0;
    for (let i = 0; i < blockSize; i += 1) {
      const byte = (i < dvBlockData.byteLength) ? dvBlockData.getUint8(i) : 0; // pad with 0
      // Checksum does not include block number byte.
      checkSum = (checkSum + byte) & 0xff;
      this.recordByte(byte);
    }
    this.recordByte(checkSum);
  }

  recordIntro() {
    this.recordOscillations(fOne, oscillationsIntro);
  }

  recordBlockIntro() {
    this.recordOscillations(fOne, oscillationsBlockIntro);
  }

  recordDelimiter() {
    this.recordOscillations(fDelimiter, 1);
  }

  recordByte(byte) {
    super.recordByte(byte);
    this.recordDelimiter();
  }

  recordBit(value) {
    if (value) {
      this.recordOscillations(fOne, 1);
    } else {
      this.recordOscillations(fZero, 1);
    }
  }
}
