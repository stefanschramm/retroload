import {BufferAccess} from '../../common/BufferAccess.js';
import {calculateChecksum8WithCarry} from '../../common/Utils.js';
import {type OptionContainer} from '../../encoding/Options.js';
import {type ConverterDefinition} from './ConverterDefinition.js';

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

function convert(data: BufferAccess, _options: OptionContainer): BufferAccess {
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
    outBa.writeUint16Le(i === 0 ? pilotIrgLength : defaultIrgLength);

    const blockBa = BufferAccess.create(132);
    blockBa.writeUint8(markerByte);
    blockBa.writeUint8(markerByte);
    const partialBlock = chunk.length() !== dataBytesPerBlock;
    const blockType = partialBlock ? blockTypePartial : blockTypeFull;
    blockBa.writeUint8(blockType);
    blockBa.writeBa(partialBlock ? chunk.chunksPadded(dataBytesPerBlock, 0x00)[0] : chunk);
    if (partialBlock) {
      blockBa.setUint8(130, chunk.length());
    }
    blockBa.setUint8(131, calculateChecksum8WithCarry(blockBa));

    outBa.writeBa(blockBa);
  }

  // end of file block
  outBa.writeAsciiString('data');
  outBa.writeUint16Le(132);
  outBa.writeUint16Le(defaultIrgLength);
  const endBlock = BufferAccess.create(132);
  endBlock.writeUint8(markerByte);
  endBlock.writeUint8(markerByte);
  endBlock.writeUint8(blockTypeEndOfFile);
  endBlock.setUint8(131, calculateChecksum8WithCarry(endBlock));
  outBa.writeBa(endBlock);

  return outBa;
}
