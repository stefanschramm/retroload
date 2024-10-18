import {Zx81Encoder} from './Zx81Encoder.js';
import {type OptionContainer, nameOption} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for ZX81 .P files
 */
const definition: InternalAdapterDefinition = {
  label: 'ZX81 .P-File',
  name: 'zx81p',
  options: [nameOption],
  identify,
  encode,
};
export default definition;

const defaultName = ' ';

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.p$/i).exec(filename) !== null,
    header: undefined, // no specific header
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const name = options.getArgument(nameOption);
  const e = new Zx81Encoder(recorder);
  e.begin();
  for (const byte of mapFileName(name.length === 0 ? defaultName : name)) {
    e.recordByte(byte);
  }
  e.recordBytes(ba);
  e.end();
}

/**
 * Map file name to ZX 81 charset
 * https://en.wikipedia.org/wiki/ZX81_character_set
 */
function mapFileName(input: string): number[] {
  const mapped = input.toUpperCase().split('').map(mapCharCode);
  mapped[mapped.length - 1] = mapped[mapped.length - 1] | 0x80; // last char: bit 7 set
  return mapped;
}

function mapCharCode(char: string): number {
  const asc = char.charCodeAt(0);
  // A - Z; A: 0x41 in ASCII charset, 0x26 in ZX 81 charset
  if (asc >= 0x41 && asc <= 0x5a) {
    return asc - 27;
  }
  // 0 - 9; 0: 0x30 in ASCII charset, 0x1c in ZX 81 charset
  if (asc >= 0x30 && asc <= 0x39) {
    return asc - 20;
  }
  // Space
  if (asc === 0x20) {
    return 0x00;
  }
  throw new InvalidArgumentError(nameOption.name, 'Filename contains invalid characters. Allowed are letters, numbers and space.');
}
