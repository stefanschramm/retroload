import {ArgumentOptionDefinition, OptionContainer, entryOption, loadOption, nameOption, parse8BitIntegerOption} from '../../Options.js';
import {FILE_TYPE_MACHINE_LANGUAGE, MAX_NAME_LENGTH, Trs80CoCoEncoder} from './Trs80CoCoEncoder.js';
import {FormatIdentification, InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

const typeOption: ArgumentOptionDefinition<number | undefined> = {
  name: 'trs80cocotype',
  label: 'File type',
  description: 'File type. Known types: 0 = BASIC program, 1 = BASIC data, 2 = machine language program. Default: 2',
  argument: 'type',
  required: false,
  common: false,
  type: 'text',
  parse(v) {
    return parse8BitIntegerOption(v, this.name);
  },
};

export const Trs80CoCoGenericAdapter: InternalAdapterDefinition = {
  label: 'TRS-80 Color Computer (Generic data)',
  name: 'trs80cocogeneric',
  options: [
    nameOption,
    loadOption,
    entryOption,
    typeOption,
  ],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const loadAddress = options.getArgument(loadOption);
  const startAddress = options.getArgument(entryOption);
  const name = options.getArgument(nameOption);
  if (name.length > MAX_NAME_LENGTH) {
    throw new InvalidArgumentError(nameOption.name, `Option name is expected to be a string of ${MAX_NAME_LENGTH} characters maximum. Example: HELLO`);
  }
  const type = options.getArgument(typeOption) ?? FILE_TYPE_MACHINE_LANGUAGE;

  const e = new Trs80CoCoEncoder(recorder);
  e.begin();
  e.recordData(
    ba,
    name,
    type,
    startAddress,
    loadAddress,
  );
  e.end();
}
