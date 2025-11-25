import {ArgumentOptionDefinition, type OptionContainer, nameOption, parse8BitIntegerOption} from '../../Options.js';
import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {Ibm5150Encoder, blockSize} from './Ibm5150Encoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InternalError} from '../../../common/Exceptions.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

// OPEN "O",1,"file"
// const TYPE_DATA = 0;

// BSAVE "file", address, length
// const TYPE_MEMORY_AREA = 1;

// SAVE "file", P
// See BASCRACK.C in http://www.etoan.com/cs19.pdf
// TODO: Check why loading protected files currently fails with "Direct statement in file"
const TYPE_PROTECTED_TOKENIZED_BASIC = 1 << 5;

// SAVE "file", A
const TYPE_ASCII_LISTING = 1 << 6;

// SAVE "file"
const TYPE_TOKENIZED_BASIC = 1 << 7;

const typeOption: ArgumentOptionDefinition<number> = {
  name: 'ibm5150basictype',
  label: 'BASIC file type',
  description: `File type. Possible types: 64 = ASCII BASIC listing, 128 = tokenized BASIC. Default: ${TYPE_ASCII_LISTING}`,
  argument: 'type',
  required: false,
  common: false,
  type: 'text',
  parse: function parse(v) {
    return parse8BitIntegerOption(v, this.name) ?? TYPE_ASCII_LISTING;
  },
};

/**
 * Adapter for IBM PC 5150 Cassette BASIC
 *
 * http://fileformats.archiveteam.org/wiki/IBM_PC_data_cassette
 */
export const Ibm5150BasicAdapter: InternalAdapterDefinition = {
  label: 'IBM 5150 BASIC',
  name: 'ibm5150basic',
  options: [nameOption, typeOption],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const type = options.getArgument(typeOption);

  const name = options.getArgument(nameOption);

  const e = new Ibm5150Encoder(recorder);

  const header = createBasicHeader(
    name,
    type,
    type === TYPE_ASCII_LISTING ? 0x0000 : ba.length(),
    type === TYPE_ASCII_LISTING ? 0x0000 : 0x0060,
    type === TYPE_ASCII_LISTING ? 0x0000 : 0x081e,
  );

  e.begin();
  e.recordSyncSequence();
  e.recordBlock(header);
  e.recordEndOfDataSequence();
  e.recordGap();

  switch (type) {
    case TYPE_TOKENIZED_BASIC: // fallthru
    case TYPE_PROTECTED_TOKENIZED_BASIC:
      recordTokenizedBasic(e, ba);
      break;
    case TYPE_ASCII_LISTING:
      recordAsciiListing(e, ba);
      break;
    default:
      throw new InternalError(`Unexpected type: ${type}`);
  }

  e.end();
}

function createBasicHeader(
  name: string,
  type: number,
  length: number,
  loadSegment: number,
  loadOffset: number,
): BufferAccess {
  if (name.length > 8) {
    throw new InternalError('Unable to create BASIC header. Name must not exceed 8 characters.');
  }

  const header = BufferAccess.create(256);
  header.writeUint8(0xa5);
  header.writeAsciiString(name, 8, 0x20); // pad with spaces
  header.writeUint8(type);
  header.writeUint16Le(length);
  header.writeUint16Le(loadSegment);
  header.writeUint16Le(loadOffset);
  header.writeUint8(0x00);
  for (let i = 0; i < 256 - 17; i++) {
    header.writeUint8(0x01); // padding
  }

  return header;
}

function recordAsciiListing(e: Ibm5150Encoder, data: BufferAccess): void {
  // TODO: fix line endings 0x0a -> 0x0d?
  for (const chunk of data.chunks(blockSize - 1)) {
    const block = BufferAccess.create(blockSize);
    block.writeUint8(chunk.length() === (blockSize - 1) ? 0 : chunk.length() + 1);
    block.writeBa(chunk);
    for (let i = 0; i < blockSize - 1 - chunk.length(); i++) {
      block.writeUint8(0);
    }
    e.recordSyncSequence();
    e.recordBlock(block);
    e.recordEndOfDataSequence();
    e.recordGap();
  }
}

function recordTokenizedBasic(e: Ibm5150Encoder, data: BufferAccess): void {
  e.recordSyncSequence();
  for (const chunk of data.chunksPadded(blockSize)) {
    e.recordBlock(chunk);
  }
  e.recordEndOfDataSequence();
  e.recordGap();
}
