import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {nameOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const definition: AdapterDefinition = {
  name: 'TA alphatronic PC (BASIC/Generic data)',
  internalName: 'tageneric',
  targetName: TaEncoder.getTargetName(),
  options: [nameOption],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const filename = options.getArgument(nameOption);
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }

  const e = new TaEncoder(recorder);
  e.begin();
  e.recordFile(filename, ba);
  e.end();
}
