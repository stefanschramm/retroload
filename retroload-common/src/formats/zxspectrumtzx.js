import {AbstractAdapter} from './adapter.js';
import {TzxProcessor} from './tzx.js';
import {Encoder} from '../encoder/zxspectrum.js';
import {containsDataAt} from '../utils.js';

const fileHeader = 'ZXTape!\x1a';

export function getName() {
  return 'ZX Spectrum .TZX-File';
}

export function getInternalName() {
  return 'zxspectrumtzx';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.tzx/i) !== null,
    header: containsDataAt(dataView, 0, fileHeader),
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
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(dataView);
  }
}
