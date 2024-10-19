import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TiEncoder} from './TiEncoder.js';

/**
 * Adapter for generic data for TI-99/4A
 */
const definition: InternalAdapterDefinition = {
  label: 'TI-99/4A (Generic)',
  name: 'tigeneric',
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
  if (ba.length() % blockSize !== 0) {
    Logger.info(`Length of data is not a multiple of ${blockSize} bytes. Last block will be padded with 0.`);
  }
  const blocks = ba.chunksPadded(64);
  if (blocks.length > 255) {
    throw new InputDataError('File contains too many blocks.');
  }
  const e = new TiEncoder(recorder);
  e.begin();
  e.recordHeader(blocks.length);
  for (const block of blocks) {
    e.recordBlock(block);
  }
  e.end();
}
