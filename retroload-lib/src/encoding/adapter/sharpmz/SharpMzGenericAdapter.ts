import {ArgumentOptionDefinition, OptionContainer, entryOption, loadOption, nameOption, shortpilotOption} from '../../Options.js';
import {FormatIdentification, InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';
import {SharpMzEncoder} from './SharpMzEncoder.js';
import {sharpmznorepeatOption} from './SharpMzDefinitions.js';

export const maxNameLength = 16;

const fileTypeMachineCode = 1;

const sharpmztypeOption: ArgumentOptionDefinition<number> = {
  name: 'sharpmztype',
  label: 'File type',
  description: 'File type. Possible types: 1 = machine code program file, 2 = MZ-80 BASIC program file, 3 = MZ-80 data file, 4 = MZ-700 data file, 5 = MZ-700 BASIC program file',
  argument: 'type',
  required: false,
  common: false,
  type: 'text',
  parse: (v) => (v === '' ? fileTypeMachineCode : parseInt(v, 16)),
};

/**
 * Adapter for generic data for Sharp MZ-700
 */
export const SharpMzGenericAdapter: InternalAdapterDefinition = {
  label: 'Sharp-MZ (Generic binary)',
  name: 'sharpmzgeneric',
  options: [
    loadOption,
    nameOption,
    entryOption,
    shortpilotOption,
    sharpmznorepeatOption,
    sharpmztypeOption,
  ],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const loadAddress = options.getArgument(loadOption);
  const entryAddress = options.getArgument(entryOption) ?? 0x0000;

  const name = options.getArgument(nameOption);
  if (name.length > maxNameLength) {
    throw new InvalidArgumentError(nameOption.name, `Option name is expected to be a string of ${maxNameLength} characters maximum. Example: HELLO`);
  }
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, 'Option load must be set.');
  }

  const fileType = options.getArgument(sharpmztypeOption);

  const nameUppercase = name.toUpperCase(); // in "SharpSCII" only uppercase letters equal ASCII

  const doRepeat = !options.isFlagSet(sharpmznorepeatOption);
  const shortpilot = options.isFlagSet(shortpilotOption);

  const header = BufferAccess.create(128);
  header.setUint8(0x00, fileType);
  header.setAsciiString(0x01, nameUppercase, 17, 0x20); // pad with spaces
  header.setUint8(0x01 + nameUppercase.length, 0x0d); // string delimiter
  header.setUint16Le(0x12, ba.length());
  header.setUint16Le(0x14, loadAddress);
  header.setUint16Le(0x16, entryAddress);

  Logger.debug('Header:');
  Logger.debug(header.asHexDump());

  const e = new SharpMzEncoder(recorder);

  e.begin();
  e.recordHeader(header, doRepeat, shortpilot);
  e.recordData(ba, doRepeat);
  e.end();
}
