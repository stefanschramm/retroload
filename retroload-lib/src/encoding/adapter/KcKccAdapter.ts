import {KcEncoder} from '../encoder/KcEncoder.js';
import {InputDataError} from '../../common/Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {kcFirstBlockOption} from './options/KcOptions.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const fileBlockSize = 128;

/**
 * KCC files contain the tape header block and file data without block numbers and checksums.
 */
const definition: AdapterDefinition = {

  name: 'KC .KCC-File',

  internalName: 'kcc',

  targetName: KcEncoder.getTargetName(),

  options: [
    kcFirstBlockOption,
  ],

  identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.kcc$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
  },
};
export default definition;
