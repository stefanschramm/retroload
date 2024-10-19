import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TiEncoder} from './TiEncoder.js';

/**
 * Adapter for TI-99/4A .FIAD files
 */
const definition: InternalAdapterDefinition = {
  label: 'TI-99/4A .FIAD-File',
  name: 'fiad',
  options: [],
  identify,
  encode,
};
export default definition;

const blockSize = 64;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  if (ba.length() < 2 * blockSize) {
    throw new InputDataError(`FIAD files need to be of a size at least ${2 * blockSize} bytes.`);
  }
  if (ba.length() % blockSize !== 0) {
    throw new InputDataError(`Length of data in FIAD file is not a multiple of ${blockSize} bytes.`);
  }
  const blocks = ba.slice(2 * blockSize).chunks(64); // first 128 bytes are skipped
  if (blocks.length > 255) {
    throw new InputDataError('FIAD file contains too many blocks.');
  }
  const e = new TiEncoder(recorder);
  e.begin();
  e.recordHeader(blocks.length);
  for (const block of blocks) {
    e.recordBlock(block);
  }
  e.end();
}
