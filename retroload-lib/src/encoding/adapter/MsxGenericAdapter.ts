import {MsxEncoder} from '../encoder/MsxEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {BufferAccess} from '../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer, loadOption, nameOption, entryOption} from '../Options.js';
import {unidentifiable, type AdapterDefinition} from './AdapterDefinition.js';
import {msxfastOption} from './options/MsxOptions.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';

const definition: AdapterDefinition = {
  name: 'MSX (Generic binary)',
  internalName: 'msxgeneric',
  targetName: MsxEncoder.getTargetName(),
  options: [
    loadOption,
    nameOption,
    entryOption,
    shortpilotOption,
    msxfastOption,
  ],
  identify,
  encode,
};
export default definition;

const typeHeaderLength = 10;
const typeHeaderBinary = 0xd0;
// TODO implement other types (basic == 0xd3, ascii == 0xea)
const maxNameLength = 6;

function identify(_filename: string, _ba: BufferAccess) {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const loadAddress = options.getArgument(loadOption);
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, 'Option load must be set for this data type.');
  }
  const entryAddress = options.getArgument(loadOption) ?? 0;
  const name = options.getArgument(nameOption);
  if (name.length > maxNameLength) {
    throw new InvalidArgumentError(nameOption.name, `Option name is expected to be a string of ${maxNameLength} characters maximum. Example: HELLO`);
  }

  const e = new MsxEncoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.isFlagSet(msxfastOption),
  );

  const headerBa = BufferAccess.create(typeHeaderLength + 6);
  for (let i = 0; i < typeHeaderLength; i++) {
    headerBa.writeUint8(typeHeaderBinary);
  }
  headerBa.writeAsciiString(name, maxNameLength, 0x20);

  const dataHeaderBa = BufferAccess.create(6);
  dataHeaderBa.writeUint16Le(loadAddress);
  dataHeaderBa.writeUint16Le(loadAddress + ba.length() - 1);
  dataHeaderBa.writeUint16Le(entryAddress);

  e.begin();
  e.recordHeader(true);
  e.recordBytes(headerBa);
  e.recordHeader(false);
  e.recordBytes(dataHeaderBa);
  e.recordBytes(ba);
  e.end();
}
