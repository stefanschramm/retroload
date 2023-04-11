import {BufferAccess} from '../BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {TOKENS} from './tokens/ta.js';

/**
 * Tokenizer for BASIC on TA alphatronic PC
 *
 * TODO:
 *
 * Number encoding (when not used as line number operand)
 *
 * -256  f2 1c 00 01
 * -255  f2 0f ff
 * -2    f2 13
 * -1    f2 12
 * 0     11
 * ...
 * 9     1a
 * 10    0f 0a
 * ...
 * 255   0f ff
 * 256   1c 00 01
 * 257   1c 01 01
 * 32111 1c 6f 7d
 * 32767 1c ff 7f
 * 32768 1d 45 32 76 80
 * 65000 1d 45 65 (00 ?)
 *
 * 1.5    1d 41 15
 * .5     1d 40 50
 * .05    1d 3f 50
 * .00005 1d 3c 50
 *
 * 1234567890123456789012345 --> 1.23456789012345E+24 --> 1f 59 12 34 56 78 90 12 35
 * 0.000000000000000000001 --> 1E-21 --> 1d 2c 10
 *
 * https://www.msx.org/forum/development/msx-development/how-basic-stored-memory
 *
 * 0BH LSB MSB ................... Octal number
 * 0CH LSB MSB ................... Hex number
 * 11H to 1AH .................... Integer 0 to 9
 * 0FH LSB ....................... Integer 10 to 255
 * 1CH LSB MSB ................... Integer 256 to 32767
 * 1DH EE DD DD DD ............... Single Precision
 * 1FH EE DD DD DD DD DD DD DD ... Double Precision
 *
 * When used as line number operand:
 *
 * 0DH LSB MSB ................... Pointer
 * 0EH LSB MSB ................... Line number
 */
export class TaBasicTokenizer {
  static getName() {
    return 'ta';
  }

  static getExtension() {
    return 'bas';
  }

  static tokenize(str: string) {
    const offset = 0x6001;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, TOKENS, str);

    const taBasBa = BufferAccess.create(lineDataBa.length() + 10); // it wants to have 10 x 0x00 at the end
    taBasBa.writeBa(lineDataBa);

    return taBasBa;
  }
}
