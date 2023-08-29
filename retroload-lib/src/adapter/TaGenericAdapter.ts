import {TaEncoder, maxFileNameLength} from '../encoder/TaEncoder.js';
import {nameOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

export class TaGenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return TaEncoder.getTargetName();
  }

  static override getName() {
    return 'TA alphatronic PC (BASIC/Generic data)';
  }

  static override getInternalName(): string {
    return 'tageneric';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
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
