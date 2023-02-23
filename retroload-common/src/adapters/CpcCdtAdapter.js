import {AbstractAdapter} from './AbstractAdapter.js';
import {CpcTzxEncoder} from '../encoder/cpctzx.js';
import {TzxProcessor} from './TzxProcessor.js';

const fileHeader = 'ZXTape!\x1a';

export class CpcCdtAdapter extends AbstractAdapter {
  static getTargetName() {
    return CpcTzxEncoder.getTargetName();
  }

  static getName() {
    return 'CPC .CDT-File';
  }

  static getInternalName() {
    return 'cpccdt';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.cdt/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder, ba, options) {
    const e = new CpcTzxEncoder(recorder);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
