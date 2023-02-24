import {AbstractAdapter} from './AbstractAdapter.js';
import {ShortpilotOption} from '../option.js';
import {C64Encoder} from '../encoder/C64Encoder.js';

const fileHeader = 'C64File';

export class C64P00Adapter extends AbstractAdapter {
  static getTargetName() {
    return C64Encoder.getTargetName();
  }

  static getName() {
    return 'C64 .P00-File';
  }

  static getInternalName() {
    return 'c64p00';
  }

  // We support p00 only, not multiple parts (p01, ...)
  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.p00$/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
    ];
  }

  // http://unusedino.de/ec64/technical/formats/pc64.html
  static encode(recorder, ba, options) {
    const fileName = ba.slice(8, 0x10);
    const loadAddress = ba.getUint16LE(0x1a);
    const data = ba.slice(0x1c);
    const e = new C64Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, fileName.asAsciiString(), data, options.shortpilot);
    e.end();
  }
}
