import {BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer} from '../../encoding/Options.js';
import {type ConverterDefinition} from './ConverterDefinition.js';

const definition: ConverterDefinition = {
  name: 'KC .TAP-File',
  identifier: 'kctap',
  options: [],
  convert,
};
export default definition;

function convert(data: BufferAccess, _options: OptionContainer): BufferAccess {
  const blocks = data.chunksPadded(128, 0x00);
  const outBa = BufferAccess.create(16 + (1 + blocks.length) * 129);

  // TODO: use options
  const header = createHeader(
    'RL',
    'COM',
    0x0300,
    0x0300 + data.length() - 1,
    0x0300,
  );

  // TAP header
  outBa.writeUint8(0xc3);
  outBa.writeAsciiString('KC-TAPE by AF. ');

  // header block (FCB)
  outBa.writeUint8(0);
  outBa.writeBa(header);

  // data blocks
  for (let i = 0; i < blocks.length; i++) {
    outBa.writeUint8(i === blocks.length - 1 ? 0xff : i + 1);
    outBa.writeBa(blocks[i]);
  }

  return outBa;
}

function createHeader(name: string, fileType: string, loadAddress: number, endAddress: number, startAddress: number): BufferAccess {
  const header = BufferAccess.create(128);

  header.writeAsciiString(name, 8, 0x00);
  header.writeAsciiString(fileType);
  header.writeUint8(0x00); // reserved
  header.writeUint8(0x00); // reserved
  header.writeUint16Le(0x0000); // PSUM (block checksum(?))
  header.writeUint8(0x00); // ARB (internal working cell(?))
  header.writeUint8(0x03); // BLNR (block number(?)) (count?)
  header.writeUint16Le(loadAddress); // AADR
  header.writeUint16Le(endAddress); // EADR
  header.writeUint16Le(startAddress); // SADR
  header.writeUint8(0x00); // SBY (protection byte)

  return header;
}
