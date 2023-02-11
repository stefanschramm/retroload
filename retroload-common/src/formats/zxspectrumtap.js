import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/zxspectrum.js';

// https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format

export function getName() {
  return 'ZX Spectrum .TAP-File';
}

export function getInternalName() {
  return 'zxspectrumtap';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.tap/i) !== null,
    header: false,
  };
}

export function getAdapters() {
  return [Adapter];
}

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    e.begin();
    let i = 0;
    while (i < ba.length()) {
      const dataLength = ba.getUint16LE(i);
      i += 2;
      e.recordStandardSpeedDataBlock(ba.slice(i, dataLength));
      i += dataLength;
    }
    e.end();
  }
}
