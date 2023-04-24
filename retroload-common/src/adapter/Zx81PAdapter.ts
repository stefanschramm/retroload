import {AbstractAdapter} from './AbstractAdapter.js';
import {Zx81Encoder} from '../encoder/Zx81Encoder.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class Zx81PAdapter extends AbstractAdapter {
  static override getTargetName() {
    return Zx81Encoder.getTargetName();
  }

  static override getName() {
    return 'ZX81 .P-File';
  }

  static override getInternalName() {
    return 'zx81p';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.p$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
