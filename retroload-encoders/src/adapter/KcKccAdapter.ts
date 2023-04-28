import {AbstractAdapter} from './AbstractAdapter.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {InputDataError} from '../Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from 'retroload-common';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileBlockSize = 128;

export class KcKccAdapter extends AbstractAdapter {
  static override getTargetName() {
    return KcEncoder.getTargetName();
  }

  static override getName() {
    return 'KC .KCC-File';
  }

  static override getInternalName() {
    return 'kckcc';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.kcc$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
