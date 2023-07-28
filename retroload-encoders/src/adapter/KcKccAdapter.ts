import {AbstractAdapter} from './AbstractAdapter.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {InputDataError} from '../Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from 'retroload-common';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {kcFirstBlockOption} from './options/KcOptions.js';

const fileBlockSize = 128;

/**
 * KCC files contain the tape header block and file data without block numbers and checksums.
 */
export class KcKccAdapter extends AbstractAdapter {
  static override getTargetName() {
    return KcEncoder.getTargetName();
  }

  static override getName() {
    return 'KC .KCC-File';
  }

  static override getInternalName() {
    return 'kcc';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.kcc$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }

  static override getOptions() {
    return [
      kcFirstBlockOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const firstBlockNumber = options.getArgument(kcFirstBlockOption);

    if (ba.length() % fileBlockSize !== 0) {
      throw new InputDataError('Length of data in KCC file is not a multiple of 128.');
    }
    const blocks = ba.chunks(fileBlockSize);
    if (blocks.length > 255) {
      throw new InputDataError('KCC file contains too many blocks.');
    }

    const e = new KcEncoder(recorder, options);

    e.begin();
    for (let i = 0; i < blocks.length; i++) {
      const isLastBlock = i === blocks.length - 1;
      const blockNumber = isLastBlock ? 0xff : (i + firstBlockNumber);
      e.recordBlock(blockNumber, blocks[i]);
    }
    e.end();
  }
}
