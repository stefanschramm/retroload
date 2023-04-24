import {AbstractAdapter} from './AbstractAdapter.js';
import {shortpilotOption, type OptionContainer} from '../Options.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
// import {C64TapWriter as C64Encoder} from '../debug/C64TapWriter.js';

export class C64PrgAdapter extends AbstractAdapter {
  static override getTargetName() {
    return C64Encoder.getTargetName();
  }

  static override getName() {
    return 'C64 .PRG-File';
  }

  static override getInternalName() {
    return 'c64prg';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.prg$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }

  static override getOptions() {
    return [
      shortpilotOption, // (not available for .tap)
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const header = ba.slice(0, 2);
    const loadAddress = header.getUint16Le(0);
    const data = ba.slice(2);
    const e = new C64Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, ' '.repeat(16), data, options.isFlagSet(shortpilotOption));
    e.end();
  }
}
