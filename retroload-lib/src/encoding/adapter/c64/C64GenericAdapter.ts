import {C64Encoder} from './C64Encoder.js';
import {loadOption, nameOption, shortpilotOption, type ArgumentOptionDefinition, type OptionContainer} from '../../Options.js';
import {InternalError, InvalidArgumentError} from '../../../common/Exceptions.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from '../AdapterDefinition.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {c64machineOption} from '../options/C64Options.js';

enum C64Type {
  basic = 'basic',
  data = 'data',
  prg = 'prg',
}

type C64TypeStrings = keyof typeof C64Type;
const c64TypeList = Object.keys(C64Type).join(', ');

const c64typeOption: ArgumentOptionDefinition<C64Type> = {
  name: 'c64type',
  label: 'C64 file type',
  description: `C64: File type. Possible types: ${c64TypeList}`,
  argument: 'type',
  required: true,
  common: false,
  type: 'text',
  enum: Object.keys(C64Type),
  parse(v) {
    const vCasted = v as C64TypeStrings;
    if (!Object.keys(C64Type).includes(vCasted)) {
      throw new InvalidArgumentError(c64typeOption.name, `Option c64type is required and expected to be one of the following values: ${c64TypeList}`);
    }

    return C64Type[vCasted];
  },
};

const definition: AdapterDefinition = {
  name: 'C64 (Generic data)',
  internalName: 'c64generic',
  targetName: C64Encoder.getTargetName(),
  options: [
    shortpilotOption,
    c64typeOption,
    nameOption,
    loadOption,
    c64machineOption,
  ],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const type = options.getArgument(c64typeOption);
  const loadAddress = options.getArgument(loadOption);
  const name = options.getArgument(nameOption);
  if (name.length > 16) {
    throw new InvalidArgumentError(nameOption.name, 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
  }
  const e = new C64Encoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.getArgument(c64machineOption),
  );
  e.begin();
  switch (type) {
    case C64Type.basic:
      checkLoadAddress(loadAddress);
      e.recordBasic(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba);
      break;
    case C64Type.prg:
      checkLoadAddress(loadAddress);
      e.recordPrg(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba);
      break;
    case C64Type.data:
      e.recordData(name.padEnd(16, ' '), ba);
      break;
    default:
      throw new InternalError('Got unknown type.');
  }
  e.end();
}

function checkLoadAddress(loadAddress: number | undefined) {
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, `Load address (argument "${loadOption.name}") must be set for this data type.`);
  }
}
