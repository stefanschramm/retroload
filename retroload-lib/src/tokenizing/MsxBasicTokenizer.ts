import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {tokens} from './tokens/msx.js';

export class MsxBasicTokenizer {
  public static getExtension() {
    return 'bas';
  }

  public static tokenize(str: string) {
    // TODO: untested
    const offset = 0x8000;

    return PointerBasedSourceTokenizer.tokenize(offset, tokens, str);
  }
}
