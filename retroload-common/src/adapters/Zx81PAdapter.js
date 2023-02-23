import {AbstractAdapter} from './AbstractAdapter.js';
import {Encoder} from '../encoder/zx81.js';

export class Zx81PAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getName() {
    return 'ZX81 .P-File';
  }

  static getInternalName() {
    return 'zx81p';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.p$/i) !== null,
      header: undefined, // no specific header
    };
  }

  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    e.begin();
    // Filename in ZX 81 charset - https://en.wikipedia.org/wiki/ZX81_character_set
    // "TEST"
    // TODO: Read file name from option/input field or filename
    e.recordByte(57);
    e.recordByte(42);
    e.recordByte(56);
    e.recordByte(57 | 0x80); // last char: bit 7 set
    e.recordData(ba);
    e.end();
  }
}
