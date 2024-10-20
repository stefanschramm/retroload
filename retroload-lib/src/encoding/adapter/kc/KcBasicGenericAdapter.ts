import {type ArgumentOptionDefinition, type FlagOptionDefinition, type OptionContainer, nameOption} from '../../Options.js';
import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {KcEncoder} from './KcEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

enum KcBasicType {
  program = 'program',
  data = 'data',
  ascii = 'ascii',
}
const kcBasicTypeDefault = KcBasicType.program;
type KcBasicTypeString = keyof typeof KcBasicType;
const kcBasicTypeList = Object.keys(KcBasicType).join(', ');

const kcBasicTypeOption: ArgumentOptionDefinition<KcBasicType> = {
  name: 'kcbasictype',
  label: 'BASIC data type',
  description: `Type of BASIC data to be loaded. Possible types: ${kcBasicTypeList}. Default: ${kcBasicTypeDefault}`,
  argument: 'type',
  common: false,
  required: false,
  type: 'text',
  enum: Object.keys(KcBasicType),
  parse(v) {
    if (v === '') {
      return KcBasicType.program;
    }
    const vCasted = v as KcBasicTypeString;
    if (Object.keys(KcBasicType).includes(v)) {
      return KcBasicType[vCasted];
    }

    throw new InvalidArgumentError(this.name, `Option ${this.name} is expected to be one of: ${kcBasicTypeList}`);
  },
};

const kcBasicProtectedOption: FlagOptionDefinition = {
  name: 'kcbasicprotected',
  label: 'Protected flag',
  description: 'Enable "copy protection" (disables LISTing programs)',
  common: false,
  type: 'bool',
};

/**
 * https://hc-ddr.hucki.net/wiki/doku.php/z9001/kassettenformate
 */
export const KcBasicGenericAdapter: InternalAdapterDefinition = {
  label: 'KC (Generic BASIC data)',
  name: 'kcbasic',
  options: [
    nameOption,
    kcBasicTypeOption,
    kcBasicProtectedOption,
  ],
  identify,
  encode,
};

const headerSize = 3 + 8; // basic header + filename
const blockSize = 128;
const maxFileNameLength = 8;
const typeMap = {
  program: 0xd3,
  data: 0xd4,
  ascii: 0xd5,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  // Note: The file name is case-sensitive (there is a difference between CLOAD "EXAMPLE" and CLOAD "example").
  const filename = options.getArgument(nameOption);
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }
  const copyProtected = options.isFlagSet(kcBasicProtectedOption);
  const basicType = options.getArgument(kcBasicTypeOption);
  const typeByte: number = typeMap[basicType] + (copyProtected ? 0x04 : 0x00);

  const firstBlockBa = BufferAccess.create(128);
  firstBlockBa.writeUint8(typeByte);
  firstBlockBa.writeUint8(typeByte);
  firstBlockBa.writeUint8(typeByte);
  firstBlockBa.writeAsciiString(filename, maxFileNameLength, 0x20);
  firstBlockBa.writeBa(ba.slice(0, blockSize - headerSize)); // TODO: data shorter?

  // Usually files are a multiple of 128. But for now we're not enforcing it because the blocks will get padded by the Encoder's recordBlock function.

  const remainingDataBa = ba.slice(blockSize - headerSize);
  const remainingBlocks = Math.ceil(remainingDataBa.length() / blockSize);

  const e = new KcEncoder(recorder);

  e.begin();
  e.recordBlock(1, firstBlockBa);
  e.recordDelimiter();
  e.recordBlockIntro(true);
  for (let i = 0; i < remainingBlocks; i++) {
    const blockNumber = i + 2;
    const remainingBytes = remainingDataBa.length() - i * blockSize;
    const blockDataBa = remainingDataBa.slice(i * blockSize, Math.min(blockSize, remainingBytes));
    e.recordBlock(blockNumber, blockDataBa);
    e.recordDelimiter();
    e.recordBlockIntro(true);
  }
  e.end();
}
