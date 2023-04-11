import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {NameOption, type OptionValues} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';

export class TaGenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return TaEncoder.getTargetName();
  }

  static override getName() {
    return 'TA alphatronic PC (BASIC/Generic data)';
  }

  static override getOptions() {
    return [
      NameOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const filename = (options.name ?? '') as string;
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const e = new TaEncoder(recorder, options);
    e.begin();
    e.recordFile(filename, ba);
    e.end();
  }
}
