import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {type OptionContainer, nameOption} from '../../Options.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {KcEncoder} from './KcEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for KC .SSS (BASIC) files
 */
export const KcSssAdapter: InternalAdapterDefinition = {
  label: 'KC .SSS-File',
  name: 'sss',
  options: [nameOption],
  identify,
  encode,
};

const headerSize = 3 + 8; // basic header + filename
const blockSize = 128;
const maxFileNameLength = 8;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.sss$/iu).exec(filename) !== null,
    header: undefined, // no specific header
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  // Note: The file name is case-sensitive (there is a difference between CLOAD "EXAMPLE" and CLOAD "example").
  const filename = options.getArgument(nameOption);
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }

  // Usually, .SSS files are a multiple of 128. But for now we're not enforcing it because the blocks will get padded by the Encoder's recordBlock function.

  const firstBlockBa = BufferAccess.create(128);
  firstBlockBa.writeUint8(0xd3);
  firstBlockBa.writeUint8(0xd3);
  firstBlockBa.writeUint8(0xd3);
  firstBlockBa.writeAsciiString(filename, maxFileNameLength, 0x20);
  firstBlockBa.writeBa(ba.slice(0, blockSize - headerSize));

  const remainingDataBa = ba.slice(blockSize - headerSize);
  const remainingBlocks = Math.ceil(remainingDataBa.length() / blockSize);

  const e = new KcEncoder(recorder);

  e.begin();
  e.recordBlock(1, firstBlockBa);
  for (let i = 0; i < remainingBlocks; i++) {
    const blockNumber = i + 2;
    const remainingBytes = remainingDataBa.length() - i * blockSize;
    const blockDataBa = remainingDataBa.slice(i * blockSize, Math.min(blockSize, remainingBytes));
    const isLastBlock = i === remainingBlocks - 1;
    e.recordBlock(isLastBlock ? 0xff : blockNumber, blockDataBa);
    // In some implementations the last block is blockNumber and in others 0xff. Not sure which is more correct.
  }
  e.recordDelimiter(); // it looks like this is needed for programs <= 2 blocks? (tested in jkcemu)
  e.end();
}
