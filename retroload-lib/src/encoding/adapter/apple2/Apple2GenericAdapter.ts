import {FlagOptionDefinition, type OptionContainer, shortpilotOption} from '../../Options.js';
import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {Apple2Encoder} from './Apple2Encoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

const apple2integerbasicOption: FlagOptionDefinition = {
  name: 'apple2integerbasic',
  label: 'Add BASIC header',
  description: 'Prepend BASIC header containing the length of the program',
  common: false,
  type: 'bool',
};

/**
 * Adapter for generic data for Apple II
 */
export const Apple2GenericAdapter: InternalAdapterDefinition = {
  label: 'Apple II (Generic data)',
  name: 'apple2generic',
  options: [
    shortpilotOption,
    apple2integerbasicOption,
  ],
  identify,
  encode,
};


function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const e = new Apple2Encoder(
    recorder,
    options.isFlagSet(shortpilotOption),
  );

  e.begin();

  if (options.isFlagSet(apple2integerbasicOption)) {
    const basicHeaderBa = BufferAccess.create(2);
    basicHeaderBa.writeUint16Le(ba.length());
    // Applesoft BASIC adds a run flag (0x55 or 0xd5)
    // basicHeaderBa.writeUint8(0x55);
    e.recordData(basicHeaderBa);
  }

  e.recordData(ba);

  e.end();
}
