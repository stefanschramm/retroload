import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {nameOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from 'retroload-common';

export class TaGenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return TaEncoder.getTargetName();
  }

  static override getName() {
    return 'TA alphatronic PC (BASIC/Generic data)';
  }

  static override getOptions() {
    return [
      nameOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const filename = options.getArgument(nameOption);
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const e = new TaEncoder(recorder, options);
    e.begin();
    e.recordFile(filename, ba);
    e.end();
  }
}
