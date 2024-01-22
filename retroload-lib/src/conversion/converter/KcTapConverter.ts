import {BufferAccess} from '../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';
import {type ArgumentOptionDefinition, entryOption, loadOption, nameOption, type OptionContainer} from '../../encoding/Options.js';
import {type ConverterDefinition} from './ConverterDefinition.js';

const kctypeOption: ArgumentOptionDefinition<string | undefined> = {
  name: 'kctype',
  label: 'File type',
  description: 'File type, 3 characters (default: COM)',
  common: false,
  required: false,
  type: 'text',
  parse(value: string) {
    if (value === '') {
      return undefined;
    }
    if (value.length !== 3) {
      throw new InvalidArgumentError(this.name, `Option ${this.name} is expected have exactly 3 characters (example: COM).`);
    }

    return value;
  },
};

const definition: ConverterDefinition = {
  name: 'KC .TAP-File',
  identifier: 'kctap',
  options: [
    loadOption,
    entryOption,
    nameOption,
  ],
  convert,
};
export default definition;

const maxFileNameLength = 8;

function convert(data: BufferAccess, options: OptionContainer): BufferAccess {
  const blocks = data.chunksPadded(128, 0x00);
  const outBa = BufferAccess.create(16 + (1 + blocks.length) * 129);

  const loadAddress = options.getArgument(loadOption) ?? 0x0300;
  const entryAddress = options.getArgument(entryOption) ?? 0xffff; // default: no auto start
  const filename = options.getArgument(nameOption) ?? '';
  const filetype = options.getArgument(kctypeOption) ?? 'COM';
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }

  const header = createHeader(
    filename,
    filetype,
    loadAddress,
    loadAddress + data.length() - 1,
    entryAddress,
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

  header.writeAsciiString(name, maxFileNameLength, 0x00);
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
