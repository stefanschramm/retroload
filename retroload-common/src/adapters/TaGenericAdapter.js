import {Encoder, maxFileNameLength} from '../encoder/ta.js';
import {NameOption} from '../option.js';
import {InvalidArgumentError} from '../exception.js';
import {AbstractGenericAdapter} from './generic.js';

export class TaGenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
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

    const e = new Encoder(recorder);
    e.begin();
    e.recordFile(filename, ba);
    e.end();
  }
}
