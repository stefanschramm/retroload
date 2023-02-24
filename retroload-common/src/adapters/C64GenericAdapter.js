import {C64Encoder} from '../encoder/C64Encoder.js';
import {LoadOption, NameOption, Option, ShortpilotOption} from '../option.js';
import {InvalidArgumentError} from '../exception.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class C64GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return C64Encoder.getTargetName();
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
      NameOption,
      LoadOption,
    ];
  }

  static encode(recorder, ba, options) {
    const type = options.c64type;
    if (!['basic', 'data', 'prg'].includes(type)) {
      throw new InvalidArgumentError('c64type', 'Option c64type is required and expected to be set to "basic", "data" or "prg".');
    }
    const loadAddress = parseInt(options.load, 16);
    const name = options.name == undefined ? '' : options.name;
    if (typeof name !== 'string' || name.length > 16) {
      throw new InvalidArgumentError('name', 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
    }

    const e = new C64Encoder(recorder, options);
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
    throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 1000');
  }
}
