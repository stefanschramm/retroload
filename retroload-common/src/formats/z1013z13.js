import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/z1013.js';

export function getName() {
  return 'Z1013 .Z13-File';
}

export function getInternalName() {
  return 'z1013z13';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.z13$/i) !== null,
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
    const e = new Encoder(recorder);
    e.begin();
    e.recordData(dataView);
    e.end();
  }
}
