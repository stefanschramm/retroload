import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/zxspectrum.js';

// https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format

export class ZxSpectrumTapAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getName() {
    return 'ZX Spectrum .TAP-File';
  }

  static getInternalName() {
    return 'zxspectrumtap';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.tap/i) !== null,
      header: undefined,
    };
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
