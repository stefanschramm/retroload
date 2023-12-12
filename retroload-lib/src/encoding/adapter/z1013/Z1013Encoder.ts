import {AbstractEncoder} from '../AbstractEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';

const blockDataSize = 32;
const fOne = 1280;
const fZero = 2560;
const fSync = 640;

/**
 * Encoder for Robotron Z 1013
 *
 * https://hc-ddr.hucki.net/wiki/doku.php/z1013/kassettenformate
 */
export class Z1013Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'z1013';
  }

  public override begin() {
    this.recordSilence(this.recorder.sampleRate); // TODO: shorten
    this.recordFirstIntro();
  }

  recordData(ba: BufferAccess) {
    let i = 0;
    for (const blockBa of ba.chunks(blockDataSize)) {
      this.recordBlock(i++, blockBa);
    }
  }

  /**
   * Instead of incrementing the block number by 1 for each block,
   * Headersave uses the load address for each block as block number.
   */
  recordHeadersaveData(ba: BufferAccess, initialBlockNumber: number) {
    let i = initialBlockNumber;
    for (const blockBa of ba.chunks(blockDataSize)) {
      this.recordBlock(i, blockBa);
      i += blockDataSize;
    }
  }

  recordBlock(blockNumber: number, blockDataBa: BufferAccess) {
    const blockBa = BufferAccess.create(2 + blockDataBa.length() + 2);
    blockBa.writeUint16Le(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.writeUint16Le(calculateChecksum(blockBa.slice(0, blockBa.length() - 2)));

    Logger.debug(blockBa.asHexDump());

    this.recordIntro();
    this.recordDelimiter();
    this.recordBytes(blockBa);
  }

  recordFirstIntro() {
    this.recordOscillations(fSync, 2000);
  }

  recordIntro() {
    this.recordOscillations(fSync, 7);
  }

  recordDelimiter() {
    this.recordOscillations(fOne, 1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordHalfOscillation(fOne);
    } else {
      this.recordOscillations(fZero, 1);
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