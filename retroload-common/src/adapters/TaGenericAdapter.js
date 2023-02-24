import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {NameOption} from '../option.js';
import {InvalidArgumentError} from '../exception.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class TaGenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return TaEncoder.getTargetName();
  }

  static getOptions() {
    return [
      NameOption,
    ];
  }

  static encode(recorder, ba, options) {
    const filename = options.name !== undefined ? options.name : '';
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const e = new TaEncoder(recorder);
    e.begin();
    e.recordFile(filename, ba);
    e.end();
  }
}
