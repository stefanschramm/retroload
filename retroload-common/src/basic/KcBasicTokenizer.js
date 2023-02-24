import {BufferAccess} from '../BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {TOKENS} from './tokens/kc852.js';

// TODO: Fix processing of REM / ! tokens (stop tokenizing, directly copy remaining line)
export class KcBasicTokenizer {
  static getName() {
    return 'kc';
  }

  static getExtension() {
    return 'sss';
  }

  static tokenize(str) {
    const offset = 0x0401;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, TOKENS, str);

    const kcSssBa = BufferAccess.create(lineDataBa.length() + 3);
    kcSssBa.writeUInt16LE(lineDataBa.length());
    kcSssBa.writeBa(lineDataBa);
    kcSssBa.writeUInt8(0x03);

    return kcSssBa;
  }
}
