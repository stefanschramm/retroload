import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/zxspectrum.js';

// https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format

export function getName() {
  return 'ZX Spectrum .TAP-File';
}

export function getInternalName() {
  return 'zxspectrumtap';
}

export function identify(filename, dataView) {
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

  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder);
    e.begin();
    let i = 0;
    while (i < dataView.byteLength) {
      const dataLength = dataView.getUint16(i, true);
      i += 2;
      const blockDataDv = dataView.referencedSlice(i, dataLength);
      e.recordStandardSpeedDataBlock(blockDataDv);
      i += blockDataDv.byteLength;
    }
    e.end();
  }
}
