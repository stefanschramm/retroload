import {BufferAccess} from '../BufferAccess.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {NameOption, type OptionValues} from '../Options.js';
import {Mo5Encoder} from '../encoder/Mo5Encoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

const maxFileNameLength = 11;

const blockTypeStart = 0x00;
const blockTypeData = 0x01;
const blockTypeEnd = 0xff;

const fileTypeBasic = 0x00;
const fileTypeData = 0x01;
const fileTypeBinary = 0x02;

const fileModeBinary = 0x00;
const fileModeText = 0xff;

export class Mo5GenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return Mo5Encoder.getTargetName();
  }

  static override getName() {
    return 'MO5 (Generic data)';
  }

  static override getOptions() {
    return [
      NameOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const filename = (options.name ?? '') as string;
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }
    // TODO: if filename contains "." and its length is shorter than maxFilenameLength or equals maxFilenameLength + 1: map ("RL.BAS" -> "RL      BAS", "EXAMPLE1.BAS" -> "EXAMPLE1BAS")

    const filetype = fileTypeBasic; // TODO: optionize
    const filemode = fileModeBinary; // TODO: optionize

    const startBlockDataBa = BufferAccess.create(maxFileNameLength + 3);
    startBlockDataBa.writeAsciiString(filename, maxFileNameLength, 0x20);
    startBlockDataBa.writeUInt8(filetype);
    startBlockDataBa.writeUInt8(filemode);
    startBlockDataBa.writeUInt8(filemode);

    const e = new Mo5Encoder(recorder, options);
    e.begin();
    e.recordStartBlock(createBlock(blockTypeStart, startBlockDataBa));
    for (const dataChunkBa of ba.chunks(254)) {
      e.recordDataBlock(createBlock(blockTypeData, dataChunkBa));
    }
    e.recordEndBlock(createBlock(blockTypeEnd, BufferAccess.create(0)));
    e.end();
  }
}

function createBlock(blockType: number, blockDataBa: BufferAccess): BufferAccess {
  const blockBa = BufferAccess.create(16 + 2 + 1 + blockDataBa.length() + 2);
  blockBa.writeAsciiString('', 16, 0x01);
  blockBa.writeUInt8(0x3c);
  blockBa.writeUInt8(0x5a);
  blockBa.writeUInt8(blockType);
  blockBa.writeUInt8((blockDataBa.length() + 2) & 0xff); // 0x100 will become 0x00
  blockBa.writeBa(blockDataBa);
  blockBa.writeUInt8(calculateChecksum(blockDataBa));

  return blockBa;
}

function calculateChecksum(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum += data.getUint8(i);
  }

  return 0x100 - (sum & 0xff);
}
