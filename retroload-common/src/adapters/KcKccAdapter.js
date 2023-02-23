import {AbstractAdapter} from './AbstractAdapter.js';
import {Encoder} from '../encoder/kc.js';
import {InputDataError} from '../exception.js';

const fileBlockSize = 128;

export class KcKccAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getName() {
    return 'KC .KCC-File';
  }

  static getInternalName() {
    return 'kckcc';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.kcc$/i) !== null,
      header: undefined, // no specific header
    };
  }

  static encode(recorder, ba, options) {
    const blocks = Math.ceil(ba.length() / fileBlockSize);

    if (blocks > 255) {
      throw new InputDataError('KCC file contains too many blocks.');
    }
    if (ba.length() % fileBlockSize !== 0) {
      throw new InputDataError('Length of data in KCC file is not a multiple of 128.');
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
