import {C64Encoder} from '../encoder/C64Encoder.js';
import {loadOption, nameOption, shortpilotOption, type ArgumentOptionDefinition, type OptionContainer} from '../Options.js';
import {InternalError, InvalidArgumentError} from '../../common/Exceptions.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const c64typeOption: ArgumentOptionDefinition<string> = {
  name: 'c64type',
  label: 'C64 file type',
  description: 'C64: File type. Possible types: basic, data, prg',
  argument: 'type',
  required: true,
  common: false,
  type: 'text',
  enum: ['basic', 'data', 'prg'],
  parse: (v) => v,
};

const definition: AdapterDefinition = {

  name: 'C64 (Generic data)',

  internalName: 'c64generic',

  targetName: C64Encoder.getTargetName(),

  identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  },

  options: [
    shortpilotOption, // (not available for .tap)
    c64typeOption,
    nameOption,
    loadOption,
  ],

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const type: string = options.getArgument(c64typeOption);
    if (!['basic', 'data', 'prg'].includes(type)) {
      throw new InvalidArgumentError(c64typeOption.name, 'Option c64type is required and expected to be set to "basic", "data" or "prg".');
    }
    const loadAddress = options.getArgument(loadOption);
    const name = options.getArgument(nameOption);
    if (name.length > 16) {
      throw new InvalidArgumentError(nameOption.name, 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
    }
    const shortpilot = options.isFlagSet(shortpilotOption);

    const e = new C64Encoder(recorder, options);
    e.begin();
    switch (type) {
      case 'basic':
        checkLoadAddress(loadAddress);
        e.recordBasic(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba, shortpilot);
        break;
      case 'prg':
        checkLoadAddress(loadAddress);
        e.recordPrg(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba, shortpilot);
        break;
      case 'data':
        e.recordData(name.padEnd(16, ' '), ba, shortpilot);
        break;
      default:
        throw new InternalError('Got unknown type.');
    }
    e.end();
  },
};
export default definition;

function checkLoadAddress(loadAddress: number | undefined) {
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, `Load address (argument "${loadOption.name}") must be set for this data type.`);
  }
}
