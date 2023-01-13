import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/c64.js';
// import {C64TapWriter as Encoder} from '../debug/c64_tap_writer.js';

export function getName() {
  return 'C64 .PRG-File';
}

export function getInternalName() {
  return 'c64prg';
}

export function identify(filename, dataView) {
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

  static encode(recorder, dataView, options) {
    const header = dataView.referencedSlice(0, 2);
    const loadAddress = header.getUint16(0, true);
    const data = dataView.referencedSlice(2);
    const e = new Encoder(recorder);
    e.begin();
    e.recordPrg(loadAddress, '                ', data);
    e.end();
  }
}
