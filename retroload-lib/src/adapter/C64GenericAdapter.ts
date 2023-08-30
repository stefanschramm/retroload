import {C64Encoder} from '../encoder/C64Encoder.js';
import {loadOption, nameOption, shortpilotOption, type ArgumentOptionDefinition, type OptionContainer} from '../Options.js';
import {InternalError, InvalidArgumentError} from '../Exceptions.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

const c64typeOption: ArgumentOptionDefinition<string> = {
  name: 'c64type',
  label: 'C64 file type',
  description: 'C64: File type. Possible types: basic, data, prg',
  argument: 'type',
  required: true,
  common: false,
  type: 'text',
  enum: ['basic', 'data', 'prg'],
  parse: (v) => v,
};

export class C64GenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return C64Encoder.getTargetName();
  }

  static override getName() {
    return 'C64 (Generic data)';
  }

  static override getInternalName(): string {
    return 'c64generic';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  }

  static override getOptions() {
    return [
      shortpilotOption, // (not available for .tap)
      c64typeOption,
      nameOption,
      loadOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const type: string = options.getArgument(c64typeOption);
    if (!['basic', 'data', 'prg'].includes(type)) {
      throw new InvalidArgumentError(c64typeOption.name, 'Option c64type is required and expected to be set to "basic", "data" or "prg".');
    }
    const loadAddress = options.getArgument(loadOption);
    const name = options.getArgument(nameOption);
    if (name.length > 16) {
      throw new InvalidArgumentError(nameOption.name, 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
    }
    const shortpilot = options.isFlagSet(shortpilotOption);

    const e = new C64Encoder(recorder, options);
    e.begin();
    switch (type) {
      case 'basic':
        checkLoadAddress(loadAddress);
        e.recordBasic(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba, shortpilot);
        break;
      case 'prg':
        checkLoadAddress(loadAddress);
        e.recordPrg(loadAddress ?? 0x1100, name.padEnd(16, ' '), ba, shortpilot);
        break;
      case 'data':
        e.recordData(name.padEnd(16, ' '), ba, shortpilot);
        break;
      default:
        throw new InternalError('Got unknown type.');
    }
    e.end();
  }
}

function checkLoadAddress(loadAddress: number | undefined) {
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, `Load address (argument "${loadOption.name}") must be set for this data type.`);
  }
}
