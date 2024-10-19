import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type OptionContainer, nameOption} from '../../Options.js';
import {TaEncoder, maxFileNameLength} from './TaEncoder.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for generic data for TA alphatronic PC
 */
const definition: InternalAdapterDefinition = {
  label: 'TA alphatronic PC (BASIC/Generic data)',
  name: 'tageneric',
  options: [nameOption],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const filename = options.getArgument(nameOption);
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }

  const e = new TaEncoder(recorder);
  e.begin();
  e.recordFile(filename, ba);
  e.end();
}
