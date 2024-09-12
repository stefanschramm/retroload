import {BufferAccess} from '../../../common/BufferAccess.js';
import {type ArgumentOptionDefinition, nameOption, type OptionContainer, loadOption} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, unidentifiable, type AdapterDefinition} from '../AdapterDefinition.js';
import {calculateChecksum8Xor} from '../../../common/Utils.js';
import {Logger} from '../../../common/logging/Logger.js';
import {TzxEncoder} from '../TzxEncoder.js';

const typeOption: ArgumentOptionDefinition<number> = {
  name: 'zxtype',
  label: 'File type',
  description: 'File type. Known types: 0 = BASIC program, 1 = array of numbers, 2 = array of characters, 3 = binary program (default). Arrays will be assigned the names a() or a$().',
  argument: 'type',
  required: false,
  common: false,
  type: 'text',
  parse: (v) => v === '' ? typeBinary : parseInt(v, 16),
};

/**
 * Adapter for generic data for ZX Spectrum
 *
 * https://faqwiki.zxnet.co.uk/wiki/Spectrum_tape_interface
 */
const definition: AdapterDefinition = {
  name: 'ZX Spectrum (Generic data)',
  internalName: 'zxspectrumgeneric',
  options: [
    nameOption,
    typeOption,
    loadOption,
  ],
  identify,
  encode,
};
export default definition;

const typeProgram = 0;
const typeNumberArray = 1;
const typeCharArray = 2;
const typeBinary = 3;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const name = options.getArgument(nameOption);
  const type = options.getArgument(typeOption);

  let param1;
  let param2;
  switch (type) {
    case typeProgram:
      // Misusing the loadOption in this case for the autostart parameter (BASIC line number).
      param1 = options.getArgument(loadOption) ?? 0x8000;
      param2 = ba.length();
      break;
    case typeNumberArray:
      param1 = 0x8100; // a()
      param2 = 0x8000;
      break;
    case typeCharArray:
      param1 = 0xc100; // a$()
      param2 = 0x8000;
      break;
    case typeBinary:
      param1 = options.getArgument(loadOption) ?? 0x8000;
      param2 = 0x8000;
      break;
    default:
      Logger.info(`Warning: The specified file type ${type} is not known. Known types: 0 (BASIC program), 1 (number array), 2 (string array), 3 (binary data)`);
      param1 = 0x8000;
      param2 = 0x8000;
      break;
  }
  // The array names a() and a$() stored at the tape doesn't seem to matter.
  // The computer uses the name specified on loading (LOAD "" CODE b()).

  const e = TzxEncoder.createForZxSpectrum(recorder);
  e.begin();

  const headerBlockBa = BufferAccess.create(19);
  headerBlockBa.writeUint8(0x00); // marker byte
  headerBlockBa.writeUint8(type);
  headerBlockBa.writeAsciiString(name, 10, 0x20);
  headerBlockBa.writeUint16Le(ba.length());
  headerBlockBa.writeUint16Le(param1);
  headerBlockBa.writeUint16Le(param2);
  headerBlockBa.writeUint8(calculateChecksum8Xor(headerBlockBa.slice(0, 18)));

  recorder.beginAnnotation('Header');
  e.recordStandardSpeedDataBlock(headerBlockBa);
  recorder.endAnnotation();

  const dataBlockBa = BufferAccess.create(ba.length() + 2);
  dataBlockBa.writeUint8(0xff); // marker byte
  dataBlockBa.writeBa(ba);
  dataBlockBa.writeUint8(calculateChecksum8Xor(dataBlockBa));

  recorder.beginAnnotation('Data');
  e.recordStandardSpeedDataBlock(dataBlockBa);
  recorder.endAnnotation();

  e.end();
}
