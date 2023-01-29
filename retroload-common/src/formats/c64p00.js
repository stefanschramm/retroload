import * as utils from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {ShortpilotOption} from '../option.js';
import {Encoder} from '../encoder/c64.js';

const fileHeader = 'C64File';

export function getName() {
  return 'C64 .P00-File';
}

export function getInternalName() {
  return 'c64p00';
}

// We support p00 only, not multiple parts (p01, ...)
export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.p00$/i) !== null,
    header: utils.containsDataAt(dataView, 0, fileHeader),
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

  // http://unusedino.de/ec64/technical/formats/pc64.html
  static encode(recorder, dataView, options) {
    const fileName = dataView.referencedSlice(8, 0x17);
    const loadAddress = dataView.getUint16(0x1a, true);
    const data = dataView.referencedSlice(0x1c);
    const e = new Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, fileName.asAsciiString(), data, options.shortpilot);
    e.end();
  }
}
