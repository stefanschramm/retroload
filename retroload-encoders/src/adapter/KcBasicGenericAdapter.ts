import {AbstractAdapter, unidentifiable} from './AbstractAdapter.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {BufferAccess} from 'retroload-common';
import {type ArgumentOptionDefinition, nameOption, type OptionContainer, type FlagOptionDefinition} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const headerSize = 3 + 8; // basic header + filename
const blockSize = 128;
const maxFileNameLength = 8;
const typeMap = {
  program: 0xd3,
  data: 0xd4,
  ascii: 0xd5,
};

export const kcBasicTypeOption: ArgumentOptionDefinition<string> = {
  name: 'kcbasictype',
  label: 'BASIC data type',
  description: `KC BASIC: Type of BASIC data to be loaded. Possible types: ${Object.keys(typeMap).join(', ')}`,
  argument: 'type',
  common: false,
  required: false,
  type: 'text',
  enum: Object.keys(typeMap),
  parse(v) {
    if (v === undefined || v === '') {
      return 'program';
    }
    if (!Object.keys(typeMap).includes(v)) {
      throw new InvalidArgumentError(this.name, `Option ${this.name} is expected to be one of: ${Object.keys(typeMap).join(', ')}`);
    }

    return v;
  },
};

export const kcBasicProtectedOption: FlagOptionDefinition = {
  name: 'kcbasicprotected',
  label: 'Protected flag',
  description: 'KC BASIC: Enable "copy protection" (disables LISTing programs)',
  common: false,
  type: 'bool',
};

/**
 * https://hc-ddr.hucki.net/wiki/doku.php/z9001/kassettenformate
 */
export class KcBasicGenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return KcEncoder.getTargetName();
  }

  static override getName() {
    return 'KC (Generic BASIC data)';
  }

  static override getInternalName() {
    return 'kcbasic';
  }

  static override identify(_filename: string, _ba: BufferAccess) {
    return unidentifiable;
  }

  static override getOptions() {
    return [
      nameOption,
      kcBasicTypeOption,
      kcBasicProtectedOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    // Note: The file name is case-sensitive (there is a difference between CLOAD "EXAMPLE" and CLOAD "example").
    const filename = options.getArgument(nameOption);
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }
    const copyProtected = options.isFlagSet(kcBasicProtectedOption);
    const basicType = options.getArgument(kcBasicTypeOption) as keyof typeof typeMap;
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

    const e = new KcEncoder(recorder, options);

    e.begin();
    e.recordBlock(1, firstBlockBa);
    e.recordDelimiter();
    e.recordBlockIntro(); // TODO: why is this required here?
    e.recordSilenceMs(1500);
    for (let i = 0; i < remainingBlocks; i++) {
      const blockNumber = i + 2;
      const remainingBytes = remainingDataBa.length() - i * blockSize;
      const blockDataBa = remainingDataBa.slice(i * blockSize, Math.min(blockSize, remainingBytes));
      e.recordBlock(blockNumber, blockDataBa);
      e.recordDelimiter();
      e.recordBlockIntro();
      e.recordSilenceMs(1500);
    }
    e.end();
  }
}
