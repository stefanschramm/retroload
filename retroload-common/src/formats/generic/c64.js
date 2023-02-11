import {AbstractAdapter} from '../adapter.js';
import {Encoder} from '../../encoder/c64.js';
import {Option, ShortpilotOption} from '../../option.js';
import {InvalidArgumentError} from '../../exception.js';

export class C64Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
      new Option(
          'c64type',
          'C64 file type',
          'File type (C 64). Possible types: basic, data, prg',
          {argument: 'type', required: true},
      ),
      // TODO: use common option for name
      new Option(
          'c64name',
          'C64 file name',
          'File name to use for loading (C 64)',
          {argument: 'name', required: false},
      ),
      // TODO: use common option for load address
      new Option(
          'c64address',
          'C64 load address',
          'Adress (hexadecimal 16-bit number) where to load the program (C 64)',
          {argument: 'address', required: false},
      ),
    ];
  }

  static encode(recorder, ba, options) {
    const type = options.c64type;
    if (!['basic', 'data', 'prg'].includes(type)) {
      throw new InvalidArgumentError('c64type', 'Option c64type is required and expected to be set to "basic", "data" or "prg".');
    }
    const loadAddress = parseInt(options.c64address, 16);
    const name = options.c64name == undefined ? '' : options.c64name;
    if (typeof name !== 'string' || name.length > 16) {
      throw new InvalidArgumentError('name', 'Option c64name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
    }

    const e = new Encoder(recorder, options);
    e.begin();
    switch (type) {
      case 'basic':
        checkLoadAddress(loadAddress);
        e.recordBasic(loadAddress, name.padEnd(16, ' '), ba, options.shortpilot);
        break;
      case 'prg':
        checkLoadAddress(loadAddress);
        e.recordPrg(loadAddress, name.padEnd(16, ' '), ba, options.shortpilot);
        break;
      case 'data':
        e.recordData(name.padEnd(16, ' '), ba, options.shortpilot);
        break;
    }
    e.end();
  }
}

function checkLoadAddress(loadAddress) {
  if (isNaN(loadAddress) || loadAddress < 0 || loadAddress > 0xffff) {
    throw new InvalidArgumentError('c64address', 'Option c64address is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 1000');
  }
}
