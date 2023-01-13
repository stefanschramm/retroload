import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/kc.js';
import {containsDataAt} from '../utils.js';

const fileHeader = '\xc3KC-TAPE by AF.';

export function getName() {
  return 'KC .TAP-File';
}

export function getInternalName() {
  return 'kctap';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.tap$/i) !== null,
    header: containsDataAt(dataView, 0, fileHeader),
  };
}

export function getAdapters() {
  return [Adapter];
}

const fileHeaderLength = 16;
const blockSize = 128;
const fileBlockSize = 1 + blockSize; // 1 byte block number

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, dataView, options) {
    const blocks = Math.ceil((dataView.byteLength - fileHeaderLength) / fileBlockSize);

    // TODO: Possible warnings when:
    // - (data.length - fileHeaderLength) % fileBlockSize !== 0
    // - more than 255 blocks
    // - last block number not 0xff

    const e = new Encoder(recorder);

    e.begin();
    for (let i = 0; i < blocks; i++) {
      const fileOffset = fileHeaderLength + i * fileBlockSize;
      const dvBlock = dataView.referencedSlice(fileOffset, fileBlockSize);
      const blockNumber = dvBlock.getUint8(0);
      const blockData = dvBlock.referencedSlice(1);
      e.recordBlock(blockNumber, blockData);
    }
    e.end();
  }
}
