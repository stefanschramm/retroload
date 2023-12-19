import {BufferAccess} from '../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';
import {calculateChecksum8WithCarry} from '../../common/Utils.js';
import {type OptionContainer, type ArgumentOptionDefinition} from '../../encoding/Options.js';
import {type ConverterDefinition} from './ConverterDefinition.js';

const irgLengthOption: ArgumentOptionDefinition<number | undefined> = {
  name: 'irglength',
  label: 'Intra record gap length',
  description: 'Gap between blocks in ms (default: 250)',
  common: false,
  required: false,
  type: 'text',
  parse(value: string) {
    if (value === '') {
      return undefined;
    }
    const casted = Number(value);
    if (isNaN(casted)) {
      throw new InvalidArgumentError(this.name, `Option ${this.name} is expected to be a number in decimal or hexadecimal notation.`);
    }

    return casted;
  },
};

const definition: ConverterDefinition = {
  name: 'Atari .CAS-File',
  identifier: 'ataricas',
  options: [],
  convert,
};
export default definition;

const markerByte = 0x55;
const blockTypeFull = 0xfc;
const blockTypePartial = 0xfa;
const blockTypeEndOfFile = 0xfe;
const dataBytesPerBlock = 128;

const pilotIrgLength = 20000;
const defaultIrgLength = 250; // TODO: longer for 'ENTER'-loading

function convert(data: BufferAccess, options: OptionContainer): BufferAccess {
  const irgLength = options.getArgument(irgLengthOption) ?? defaultIrgLength;

  const chunks = data.chunks(dataBytesPerBlock);

  // FUJI-Header, baud-block, data blocks, end of file block
  const outBa = BufferAccess.create(8 + 8 + (chunks.length + 1) * (8 + 132));

  outBa.writeAsciiString('FUJI');
  outBa.writeUint16Le(0x0000);
  outBa.writeUint16Le(0x0000);

  outBa.writeAsciiString('baud');
  outBa.writeUint16Le(0x0000);
  outBa.writeUint16Le(600); // default baud rate

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    outBa.writeAsciiString('data');
    outBa.writeUint16Le(132);
    outBa.writeUint16Le(i === 0 ? pilotIrgLength : irgLength);
    outBa.writeBa(createDataBlock(chunk));
  }

  // end of file block
  outBa.writeAsciiString('data');
  outBa.writeUint16Le(132);
  outBa.writeUint16Le(irgLength);
  outBa.writeBa(createEndBlock());

  return outBa;
}

function createDataBlock(data: BufferAccess): BufferAccess {
  const dataBlock = BufferAccess.create(132);
  dataBlock.writeUint8(markerByte);
  dataBlock.writeUint8(markerByte);
  const partialBlock = data.length() !== dataBytesPerBlock;
  const blockType = partialBlock ? blockTypePartial : blockTypeFull;
  dataBlock.writeUint8(blockType);
  dataBlock.writeBa(partialBlock ? data.chunksPadded(dataBytesPerBlock, 0x00)[0] : data);
  if (partialBlock) {
    dataBlock.setUint8(130, data.length());
  }
  dataBlock.setUint8(131, calculateChecksum8WithCarry(dataBlock));

  return dataBlock;
}

function createEndBlock(): BufferAccess {
  const endBlock = BufferAccess.create(132);
  endBlock.writeUint8(markerByte);
  endBlock.writeUint8(markerByte);
  endBlock.writeUint8(blockTypeEndOfFile);
  endBlock.setUint8(131, calculateChecksum8WithCarry(endBlock));

  return endBlock;
}
