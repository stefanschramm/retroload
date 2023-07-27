import {Lc80Encoder} from '../encoder/Lc80Encoder.js';
import {loadOption, nameOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {type BufferAccess} from 'retroload-common';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

export class Lc80GenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return Lc80Encoder.getTargetName();
  }

  static override getName() {
    return 'LC80 (Generic data)';
  }

  static override getInternalName(): string {
    return 'lc80generic';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  }

  static override getOptions() {
    return [
      nameOption,
      loadOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const fileNumber = parseInt(options.getArgument(nameOption), 16);
    if (isNaN(fileNumber) || fileNumber < 0 || fileNumber > 0xffff) {
      throw new InvalidArgumentError('name', 'Option name is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 0001');
    }

    const loadAddress = options.getArgument(loadOption);
    if (loadAddress === undefined) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const e = new Lc80Encoder(recorder, options);
    e.begin();
    const endAddress = loadAddress + ba.length();
    e.recordHeader(fileNumber, loadAddress, endAddress);
    e.recordData(ba);
    e.end();
  }
}
