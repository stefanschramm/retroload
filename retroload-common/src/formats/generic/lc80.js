import {AbstractAdapter} from '../adapter.js';
import {Encoder as Lc80Encoder} from '../../encoder/lc80.js';
import {Option} from '../../option.js';
import {InvalidArgumentError} from '../../exception.js';

export class Lc80Adapter extends AbstractAdapter {
  static getTargetName() {
    return Lc80Encoder.getTargetName();
  }

  static getOptions() {
    return [
      new Option(
          'lc80name',
          'LC 80 file name (number)',
          'File name (actually hexadecimal 16-bit number) to use for loading (LC 80), default: ffff',
          {argument: 'name', required: false, defaultValue: 'ffff'},
      ),
      new Option(
          'lc80start',
          'LC 80 load address',
          'Adress (hexadecimal 16-bit number) where to load the program (LC 80)',
          {argument: 'address', required: true},
      ),
    ];
  }

  static encode(recorder, ba, options) {
    const fileNumber = parseInt(options.lc80name, 16);
    if (isNaN(fileNumber) || fileNumber < 0 || fileNumber > 0xffff) {
      throw new InvalidArgumentError('lc80name', 'Option lc80name is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 0001');
    }

    const startAddress = parseInt(options.lc80start, 16);
    if (isNaN(startAddress) || startAddress < 0 || startAddress > 0xffff) {
      throw new InvalidArgumentError('lc80start', 'Option lc80start is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const e = new Lc80Encoder(recorder);
    e.begin();
    const endAddress = startAddress + ba.length();
    e.recordHeader(fileNumber, startAddress, endAddress);
    e.recordData(ba);
    e.end();
  }
}
