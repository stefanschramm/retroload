import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {NameOption, type OptionValues} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';

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

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const filename = options.name !== undefined ? (options.name as string) : '';
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const e = new TaEncoder(recorder, options);
    e.begin();
    e.recordFile(filename, ba);
    e.end();
  }
}
