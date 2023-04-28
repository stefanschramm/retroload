import {BufferAccess} from 'retroload-common';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {tokens} from './tokens/c64.js';

export class C64BasicTokenizer {
  static getName() {
    return 'c64';
  }

  static getExtension() {
    return 'prg';
  }

  static tokenize(str: string) {
    // TODO: Offer option to convert to PETSCII
    const offset = 0x0800;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, tokens, str);

    const c64PrgBa = BufferAccess.create(lineDataBa.length() + 3);
    c64PrgBa.writeUint16Le(offset);
    c64PrgBa.writeUint8(0);
    c64PrgBa.writeBa(lineDataBa);

    return c64PrgBa;
  }
}
