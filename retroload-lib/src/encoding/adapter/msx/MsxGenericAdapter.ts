import {MsxEncoder} from './MsxEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer, loadOption, nameOption, entryOption} from '../../Options.js';
import {unidentifiable, type AdapterDefinition} from '../AdapterDefinition.js';
import {msxTypeOption, msxfastOption} from './MsxOptions.js';
import {InternalError, InvalidArgumentError} from '../../../common/Exceptions.js';
import {MsxType, maxNameLength, typeHeaderLength, typeHeaderMap} from './MsxDefinitions.js';

/**
 * Adapter for generic data for MSX
 */
const definition: AdapterDefinition = {
  name: 'MSX (Generic binary)',
  internalName: 'msxgeneric',
  options: [
    loadOption,
    nameOption,
    entryOption,
    shortpilotOption,
    msxfastOption,
    msxTypeOption,
  ],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess) {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const loadAddress = options.getArgument(loadOption);
  const entryAddress = options.getArgument(loadOption);
  const name = options.getArgument(nameOption);
  if (name.length > maxNameLength) {
    throw new InvalidArgumentError(nameOption.name, `Option name is expected to be a string of ${maxNameLength} characters maximum. Example: HELLO`);
  }
  const msxType = options.getArgument(msxTypeOption);

  const e = new MsxEncoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.isFlagSet(msxfastOption),
  );

  const headerBa = BufferAccess.create(typeHeaderLength + 6);
  for (let i = 0; i < typeHeaderLength; i++) {
    headerBa.writeUint8(typeHeaderMap[msxType]);
  }
  headerBa.writeAsciiString(name, maxNameLength, 0x20);

  e.begin();
  e.recordHeader(true);
  e.recordBytes(headerBa);
  switch (msxType) {
    case MsxType.binary:
      recordBinary(e, ba, loadAddress, entryAddress);
      break;
    case MsxType.basic:
      recordBasic(e, ba);
      break;
    case MsxType.ascii:
      recordAscii(e, ba);
      break;
    default:
      throw new InternalError('Got unexpected MSX file type.');
  }
  e.end();
}

function recordBinary(e: MsxEncoder, ba: BufferAccess, loadAddress: number | undefined, entryAddress: number | undefined) {
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, 'Option load must be set for this data type.');
  }

  const headerBa = BufferAccess.create(6);
  headerBa.writeUint16Le(loadAddress);
  headerBa.writeUint16Le(loadAddress + ba.length() - 1);
  headerBa.writeUint16Le(entryAddress ?? 0x0000);

  e.recordHeader(false);
  e.recordBytes(headerBa);
  e.recordBytes(ba);
}

function recordBasic(e: MsxEncoder, ba: BufferAccess) {
  for (const chunkBa of ba.chunksPadded(256, 0x00)) {
    e.recordHeader(false);
    e.recordBytes(chunkBa);
  }
}

function recordAscii(e: MsxEncoder, ba: BufferAccess) {
  for (const chunkBa of ba.chunksPadded(256, 0x1a)) {
    e.recordHeader(false);
    e.recordBytes(chunkBa);
  }
}
