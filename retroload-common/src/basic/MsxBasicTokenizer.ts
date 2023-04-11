import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {TOKENS} from './tokens/msx.js';

export class MsxBasicTokenizer {
  static getExtension() {
    return 'bas';
  }

  static tokenize(str: string) {
    // TODO: untested
    const offset = 0x8000;

    return PointerBasedSourceTokenizer.tokenize(offset, TOKENS, str);
  }
}
