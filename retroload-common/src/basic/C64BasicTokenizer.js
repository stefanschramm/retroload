import {BufferAccess} from '../BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {TOKENS} from './tokens/c64.js';

export class C64BasicTokenizer {
  static getName() {
    return 'c64';
  }

  static getExtension() {
    return 'prg';
  }

  static tokenize(str) {
    // TODO: Offer option to convert to PETSCII
    const offset = 0x0800;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, TOKENS, str);

    const c64PrgBa = BufferAccess.create(lineDataBa.length() + 3);
    c64PrgBa.writeUInt16LE(offset);
    c64PrgBa.writeUInt8(0);
    c64PrgBa.writeBa(lineDataBa);

    return c64PrgBa;
  }
}
