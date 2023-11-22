import {MsxEncoder} from './MsxEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer, loadOption, nameOption, entryOption, type ArgumentOptionDefinition} from '../../Options.js';
import {unidentifiable, type AdapterDefinition} from '../AdapterDefinition.js';
import {msxfastOption} from '../options/MsxOptions.js';
import {InternalError, InvalidArgumentError} from '../../../common/Exceptions.js';

enum MsxType {
  binary = 'binary',
  basic = 'basic',
  ascii = 'ascii',
}

type MsxTypeStrings = keyof typeof MsxType;
const msxTypeList = Object.keys(MsxType).join(', ');

const msxTypeOption: ArgumentOptionDefinition<MsxType> = {
  name: 'msxtype',
  label: 'MSX file type',
  description: `MSX: File type. Possible types: ${msxTypeList}`,
  argument: 'type',
  required: true,
  common: false,
  type: 'text',
  enum: Object.keys(MsxType),
  parse(v) {
    const vCasted = v as MsxTypeStrings;
    if (!Object.keys(MsxType).includes(vCasted)) {
      throw new InvalidArgumentError(msxTypeOption.name, `Option msxtype is required and expected to be one of the following values: ${msxTypeList}`);
    }

    return MsxType[vCasted];
  },
};

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
    msxTypeOption,
  ],
  identify,
  encode,
};
export default definition;

const typeHeaderMap: Record<MsxType, number> = {
  [MsxType.binary]: 0xd0,
  [MsxType.basic]: 0xd3,
  [MsxType.ascii]: 0xea,
};
const typeHeaderLength = 10;
const maxNameLength = 6;

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
