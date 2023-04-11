import {Lc80Encoder} from '../encoder/Lc80Encoder.js';
import {LoadOption, NameOption, type OptionValues} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export class Lc80GenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return Lc80Encoder.getTargetName();
  }

  static override getName() {
    return 'LC80 (Generic data)';
  }

  static override getOptions() {
    return [
      NameOption,
      LoadOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const fileNumber = parseInt(options.name as string, 16);
    if (isNaN(fileNumber) || fileNumber < 0 || fileNumber > 0xffff) {
      throw new InvalidArgumentError('name', 'Option name is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 0001');
    }

    const loadAddress = parseInt(options.load as string, 16);
    if (isNaN(loadAddress) || loadAddress < 0 || loadAddress > 0xffff) {
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
