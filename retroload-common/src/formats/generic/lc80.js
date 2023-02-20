import {AbstractAdapter} from '../adapter.js';
import {Encoder as Lc80Encoder} from '../../encoder/lc80.js';
import {LoadOption, NameOption} from '../../option.js';
import {InvalidArgumentError} from '../../exception.js';

export class Lc80Adapter extends AbstractAdapter {
  static getTargetName() {
    return Lc80Encoder.getTargetName();
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
