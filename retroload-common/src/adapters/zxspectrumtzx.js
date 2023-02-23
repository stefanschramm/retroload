import {AbstractAdapter} from './adapter.js';
import {TzxProcessor} from './tzx.js';
import {Encoder} from '../encoder/zxspectrum.js';

const fileHeader = 'ZXTape!\x1a';

export class ZxSpectrumTzxAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getName() {
    return 'ZX Spectrum .TZX-File';
  }

  static getInternalName() {
    return 'zxspectrumtzx';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.tzx/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
