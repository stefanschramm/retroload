import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/kc.js';

export function getName() {
  return 'KC .KCC-File';
}

export function getInternalName() {
  return 'kckcc';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.kcc$/i) !== null,
    header: undefined, // no specific header
  };
}

export function getAdapters() {
  return [Adapter];
}

const fileBlockSize = 128;

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const blocks = Math.ceil(ba.length() / fileBlockSize);

    if (blocks > 255) {
      throw new Error('KCC file contains too many blocks.');
    }
    if (ba.length() % fileBlockSize !== 0) {
      throw new Error('Length of data in KCC file is not a multiple of 128.');
    }

    const e = new Encoder(recorder);

    e.begin();
    for (let i = 0; i < blocks; i++) {
      const fileOffset = i * fileBlockSize;
      const blockData = ba.slice(fileOffset, fileBlockSize);
      const blockNumber = (i + 1 < blocks) ? (i + 1) : 0xff;
      e.recordBlock(blockNumber, blockData);
    }
    e.end();
  }
}
