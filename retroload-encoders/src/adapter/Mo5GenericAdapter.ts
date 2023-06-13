import {BufferAccess} from 'retroload-common';
import {InvalidArgumentError} from '../Exceptions.js';
import {type OptionDefinition, nameOption, type ArgumentOptionDefinition, type OptionContainer} from '../Options.js';
import {Mo5Encoder} from '../encoder/Mo5Encoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

const maxFileNameLength = 11;

const blockTypeStart = 0x00;
const blockTypeData = 0x01;
const blockTypeEnd = 0xff;

const fileTypeBasic = 0x00; // other types: 1 == data, 2 == binary
const fileModeBinary = 0x00; // other modes: 0xff == text

const typeOption: ArgumentOptionDefinition<number> = {
  name: 'mo5type',
  label: 'MO5 file type',
  description: 'MO5: File type. Possible types: 0 = basic (default), 1 = data, 2 = binary',
  argument: 'type',
  required: false,
  common: false,
  type: 'text',
  parse: (v) => v === '' ? fileTypeBasic : parseInt(v, 16),
};

const modeOption: ArgumentOptionDefinition<number> = {
  name: 'mo5mode',
  label: 'MO5 file mode',
  description: 'MO5: File mode. Possible modes: 0 = binary (default), ff = text',
  argument: 'mode',
  required: false,
  common: false,
  type: 'text',
  parse: (v) => v === '' ? fileModeBinary : parseInt(v, 16),
};

export class Mo5GenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return Mo5Encoder.getTargetName();
  }

  static override getName() {
    return 'MO5 (Generic data)';
  }

  static override getOptions(): OptionDefinition[] {
    return [
      nameOption,
      typeOption,
      modeOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const filename = options.getArgument(nameOption);
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const filetype = options.getArgument(typeOption);
    const filemode = options.getArgument(modeOption);

    const startBlockDataBa = BufferAccess.create(maxFileNameLength + 3);
    startBlockDataBa.writeAsciiString(filename, maxFileNameLength, 0x20);
    startBlockDataBa.writeUint8(filetype);
    startBlockDataBa.writeUint8(filemode);
    startBlockDataBa.writeUint8(filemode);

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
  blockBa.writeUint8(0x3c);
  blockBa.writeUint8(0x5a);
  blockBa.writeUint8(blockType);
  blockBa.writeUint8((blockDataBa.length() + 2) & 0xff); // 0x100 will become 0x00
  blockBa.writeBa(blockDataBa);
  blockBa.writeUint8(calculateChecksum(blockDataBa));

  return blockBa;
}

function calculateChecksum(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum += data.getUint8(i);
  }

  return 0x100 - (sum & 0xff);
}
