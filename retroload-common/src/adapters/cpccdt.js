import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/cpctzx.js';
import {TzxProcessor} from './tzx.js';

const fileHeader = 'ZXTape!\x1a';

export class CpcCdtAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
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
    const e = new Encoder(recorder);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
