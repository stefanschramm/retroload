import {type BufferAccess} from '../../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer, type FlagOptionDefinition} from '../../Options.js';
import {BasicodeEncoder} from './BasicodeEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type InternalAdapterDefinition, type FormatIdentification} from '../AdapterDefinition.js';

const basicodeDataOption: FlagOptionDefinition = {
  name: 'basicodedata',
  label: 'BASICODE data recording',
  description: 'Record as data (will split data into 1024 byte chunks and uses STH as start byte',
  type: 'bool',
  common: false,
};

const definition: InternalAdapterDefinition = {
  name: 'BASICODE (ASCII plain text)',
  internalName: 'basicode',
  options: [
    shortpilotOption,
    basicodeDataOption,
  ],
  identify,
  encode,
};
export default definition;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.(bc2|asc|bc|bas)$/i).exec(filename) !== null,
    header: undefined,
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const e = new BasicodeEncoder(recorder, options.isFlagSet(shortpilotOption));
  e.begin();
  if (options.isFlagSet(basicodeDataOption)) {
    e.recordBasicData(ba);
  } else {
    e.recordBasicProgram(ba);
  }
  e.end();
}
