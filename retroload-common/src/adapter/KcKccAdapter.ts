import {AbstractAdapter} from './AbstractAdapter.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {InputDataError} from '../Exceptions.js';
import {type OptionValues} from '../Options.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileBlockSize = 128;

export class KcKccAdapter extends AbstractAdapter {
  static getTargetName() {
    return KcEncoder.getTargetName();
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

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const blocks = Math.ceil(ba.length() / fileBlockSize);

    if (blocks > 255) {
      throw new InputDataError('KCC file contains too many blocks.');
    }
    if (ba.length() % fileBlockSize !== 0) {
      throw new InputDataError('Length of data in KCC file is not a multiple of 128.');
    }

    const e = new KcEncoder(recorder, options);

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
