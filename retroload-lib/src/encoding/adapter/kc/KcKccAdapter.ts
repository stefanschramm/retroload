import {KcEncoder} from './KcEncoder.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {kcFirstBlockOption} from './KcOptions.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for KC .KCC files
 *
 * KCC files contain the tape header block and file data without block numbers and checksums.
 */
const definition: InternalAdapterDefinition = {
  name: 'KC .KCC-File',
  internalName: 'kcc',
  options: [kcFirstBlockOption],
  identify,
  encode,
};
export default definition;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.kcc$/i).exec(filename) !== null,
    header: undefined, // no specific header
  };
}

const fileBlockSize = 128;

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const firstBlockNumber = options.getArgument(kcFirstBlockOption);

  if (ba.length() % fileBlockSize !== 0) {
    throw new InputDataError('Length of data in KCC file is not a multiple of 128.');
  }
  const blocks = ba.chunks(fileBlockSize);
  if (blocks.length > 255) {
    throw new InputDataError('KCC file contains too many blocks.');
  }

  const e = new KcEncoder(recorder);

  e.begin();
  for (let i = 0; i < blocks.length; i++) {
    const isLastBlock = i === blocks.length - 1;
    const blockNumber = isLastBlock ? 0xff : (i + firstBlockNumber);
    e.recordBlock(blockNumber, blocks[i]);
  }
  e.end();
}
