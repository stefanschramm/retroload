import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {NameOption} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class TaGenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return TaEncoder.getTargetName();
  }

  static getName() {
    return 'TA alphatronic PC (BASIC/Generic data)';
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
