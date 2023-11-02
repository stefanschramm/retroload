import {type BufferAccess} from '../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer, type FlagOptionDefinition} from '../Options.js';
import {BasicodeEncoder} from '../encoder/BasicodeEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type AdapterDefinition, type FormatIdentification} from './AdapterDefinition.js';

const basicodeDataOption: FlagOptionDefinition = {
  name: 'basicodedata',
  label: 'BASICODE data recording',
  description: 'Record as BASICODE data (will split data into 1024 byte chunks and uses STH as start byte',
  type: 'bool',
  common: false,
};

const definition: AdapterDefinition = {

  name: 'BASICODE (ASCII plain text)',

  internalName: 'basicode',

  targetName: BasicodeEncoder.getTargetName(),

  options: [
    shortpilotOption,
    basicodeDataOption,
  ],

  identify(filename: string, _ba: BufferAccess): FormatIdentification {
    return {
      filename: (/^.*\.(bc2|asc|bc|bas)$/i).exec(filename) !== null,
      header: undefined,
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new BasicodeEncoder(recorder, options.isFlagSet(shortpilotOption));
    e.begin();
    if (options.isFlagSet(basicodeDataOption)) {
      e.recordBasicData(ba);
    } else {
      e.recordBasicProgram(ba);
    }
    e.end();
  },
};
export default definition;
