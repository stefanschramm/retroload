import {FlagOptionDefinition, OptionContainer, loadOption, nameOption, shortpilotOption} from '../../Options.js';
import {FormatIdentification, InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {OricEncoder} from './OricEncoder.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

const typeBinary = 0x80;

export const oricAutostartOption: FlagOptionDefinition = {
  name: 'oricautostart',
  label: 'Autostart',
  description: 'Enables automatic start of loaded program',
  type: 'bool',
  common: false,
};

export const OricGenericAdapter: InternalAdapterDefinition = {
  label: 'Oric (Generic binary)',
  name: 'oricgeneric',
  options: [
    shortpilotOption,
    loadOption,
    nameOption,
    oricAutostartOption,
  ],
  identify,
  encode,
};

export const maxNameLength = 15;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  // https://www.osdk.org/index.php?page=documentation&subpage=memorymap
  // 0xbb80 = screen memory
  // 0x0500 = free memory
  const loadAddress = options.getArgument(loadOption) ?? 0x0500;

  const name = options.getArgument(nameOption);
  if (name.length > maxNameLength) {
    throw new InvalidArgumentError(nameOption.name, `Option name is expected to be a string of ${maxNameLength} characters maximum. Example: HELLO`);
  }

  const e = new OricEncoder(
    recorder,
    options.isFlagSet(shortpilotOption),
  );
  e.begin();
  e.recordHeader(
    typeBinary,
    options.isFlagSet(oricAutostartOption) ? 0xcf : 0x00,
    name,
    loadAddress,
    loadAddress + ba.length() - 1,
  );
  e.recordBytes(ba);
  e.end();
}
