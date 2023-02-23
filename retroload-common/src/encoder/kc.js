import {BaseEncoder} from './base.js';
import {BufferAccess} from '../buffer_access.js';
import {InputDataError} from '../exception.js';
import {Logger} from '../logger.js';

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
export class KcEncoder extends BaseEncoder {
  static getTargetName() {
    return 'kc';
  }

  begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
    this.recordIntro();
  }

  recordBlock(blockNumber, blockDataBa) {
    if (blockDataBa.length() > blockSize) {
      throw new InputDataError('Block data exceeds length of 128 bytes');
    }
    this.recordBlockIntro();
    this.recordDelimiter();

    const checksum = this.calculateChecksum(blockDataBa);

    Logger.debug(`KcEncoder - recordBlock: blockNumber: 0x${blockNumber.toString(16).padStart(2, 0)}, checksum: 0x${checksum.toString(16).padStart(2, 0)}`);
    Logger.debug(blockDataBa.asHexDump());

    const blockBa = BufferAccess.create(1 + blockSize + 1);
    blockBa.writeUInt8(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.setUint8(blockSize + 1, checksum);

    this.recordBytes(blockBa);
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

  calculateChecksum(data) {
    let sum = 0;
    for (let i = 0; i < data.length(); i++) {
      sum += data.getUint8(i);
    }

    return sum & 0xff;
  }
}
