import {BufferAccess} from '../BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {TOKENS} from './tokens/ta.js';

export class TaBasicTokenizer {
  static getName() {
    return 'ta';
  }

  static getExtension() {
    return 'bas';
  }

  static tokenize(str) {
    const offset = 0x6001;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, TOKENS, str);

    const taBasBa = BufferAccess.create(lineDataBa.length() + 10); // it wants to have 10 x 0x00 at the end
    taBasBa.writeBa(lineDataBa);

    return taBasBa;
  }
}
