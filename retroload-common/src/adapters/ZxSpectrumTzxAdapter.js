import {AbstractAdapter} from './AbstractAdapter.js';
import {TzxProcessor} from './TzxProcessor.js';
import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';

const fileHeader = 'ZXTape!\x1a';

export class ZxSpectrumTzxAdapter extends AbstractAdapter {
  static getTargetName() {
    return ZxSpectrumTzxEncoder.getTargetName();
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
    const e = new ZxSpectrumTzxEncoder(recorder);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
