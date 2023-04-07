import {AbstractAdapter} from './AbstractAdapter.js';
import {Zx81Encoder} from '../encoder/Zx81Encoder.js';
import {type OptionValues} from '../Options.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export class Zx81PAdapter extends AbstractAdapter {
  static getTargetName() {
    return Zx81Encoder.getTargetName();
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

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new Zx81Encoder(recorder, options);
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
