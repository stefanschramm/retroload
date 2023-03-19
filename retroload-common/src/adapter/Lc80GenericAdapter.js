import {Lc80Encoder} from '../encoder/Lc80Encoder.js';
import {LoadOption, NameOption} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class Lc80GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Lc80Encoder.getTargetName();
  }

  static getName() {
    return 'LC80 (Generic data)';
  }

  static getOptions() {
    return [
      NameOption,
      LoadOption,
    ];
  }

  static encode(recorder, ba, options) {
    const fileNumber = parseInt(options.name, 16);
    if (isNaN(fileNumber) || fileNumber < 0 || fileNumber > 0xffff) {
      throw new InvalidArgumentError('name', 'Option name is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 0001');
    }

    const loadAddress = parseInt(options.load, 16);
    if (isNaN(loadAddress) || loadAddress < 0 || loadAddress > 0xffff) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const e = new Lc80Encoder(recorder);
    e.begin();
    const endAddress = loadAddress + ba.length();
    e.recordHeader(fileNumber, loadAddress, endAddress);
    e.recordData(ba);
    e.end();
  }
}
