import {AbstractAdapter} from './AbstractAdapter.js';
import {ShortpilotOption} from '../Options.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
// import {C64TapWriter as C64Encoder} from '../debug/C64TapWriter.js';

export class C64PrgAdapter extends AbstractAdapter {
  static getTargetName() {
    return C64Encoder.getTargetName();
  }

  static getName() {
    return 'C64 .PRG-File';
  }

  static getInternalName() {
    return 'c64prg';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.prg$/i) !== null,
      header: undefined, // no specific header
    };
  }

  static getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
    ];
  }

  static encode(recorder, ba, options) {
    const header = ba.slice(0, 2);
    const loadAddress = header.getUint16LE(0);
    const data = ba.slice(2);
    const e = new C64Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, ' '.repeat(16), data, options.shortpilot);
    e.end();
  }
}
