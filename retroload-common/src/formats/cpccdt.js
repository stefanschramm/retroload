import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/cpctzx.js';
import {TzxProcessor} from './tzx.js';

const fileHeader = 'ZXTape!\x1a';

export function getName() {
  return 'CPC .CDT-File';
}

export function getInternalName() {
  return 'cpccdt';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.cdt/i) !== null,
    header: ba.containsDataAt(0, fileHeader),
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
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
