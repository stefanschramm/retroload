import {BufferAccess} from '../common/BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {tokens} from './tokens/kc852.js';

// TODO: Fix processing of REM / ! tokens (stop tokenizing, directly copy remaining line)
export class KcBasicTokenizer {
  public static getName() {
    return 'kc';
  }

  public static getExtension() {
    return 'sss';
  }

  public static tokenize(str: string) {
    const offset = 0x0401;
    const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, tokens, str);

    const kcSssBa = BufferAccess.create(lineDataBa.length() + 3);
    kcSssBa.writeUint16Le(lineDataBa.length());
    kcSssBa.writeBa(lineDataBa);
    kcSssBa.writeUint8(0x03);

    return kcSssBa;
  }
}
