import {AbstractAdapter} from './adapter.js';
import {ShortpilotOption} from '../option.js';
import {Encoder} from '../encoder/c64.js';
// import {C64TapWriter as Encoder} from '../debug/c64_tap_writer.js';

export function getName() {
  return 'C64 .PRG-File';
}

export function getInternalName() {
  return 'c64prg';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.prg$/i) !== null,
    header: undefined, // no specific header
  };
}

export function getAdapters() {
  return [Adapter];
}

class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
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
    const e = new Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, ' '.repeat(16), data, options.shortpilot);
    e.end();
  }
}
