import {C64Encoder} from '../encoder/C64Encoder.js';
import {LoadOption, NameOption, Option, type OptionValues, ShortpilotOption} from '../Options.js';
import {InternalError, InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export class C64GenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return C64Encoder.getTargetName();
  }

  static override getName() {
    return 'C64 (Generic data)';
  }

  static override getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
      new Option(
        'c64type',
        'C64 file type',
        'File type (C 64). Possible types: basic, data, prg',
        {argument: 'type', required: true, type: 'enum', enum: ['basic', 'data', 'prg']},
      ),
      NameOption,
      LoadOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const type: string = options.c64type as string;
    if (!['basic', 'data', 'prg'].includes(type)) {
      throw new InvalidArgumentError('c64type', 'Option c64type is required and expected to be set to "basic", "data" or "prg".');
    }
    const loadAddress = parseInt(options.load as string, 16);
    const name = options.name ?? '';
    if (typeof name !== 'string' || name.length > 16) {
      throw new InvalidArgumentError('name', 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
    }

    const e = new C64Encoder(recorder, options);
    e.begin();
    switch (type) {
      case 'basic':
        checkLoadAddress(loadAddress);
        e.recordBasic(loadAddress, name.padEnd(16, ' '), ba, options.shortpilot as boolean);
        break;
      case 'prg':
        checkLoadAddress(loadAddress);
        e.recordPrg(loadAddress, name.padEnd(16, ' '), ba, options.shortpilot as boolean);
        break;
      case 'data':
        e.recordData(name.padEnd(16, ' '), ba, options.shortpilot as boolean);
        break;
      default:
        throw new InternalError('Got unknown type.');
    }
    e.end();
  }
}

function checkLoadAddress(loadAddress: number) {
  if (isNaN(loadAddress) || loadAddress < 0 || loadAddress > 0xffff) {
    throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 1000');
  }
}
