import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {type OptionContainer, nameOption, shortpilotOption} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {C64Encoder} from './C64Encoder.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {c64machineOption} from './C64Options.js';

/**
 * Adapter for C64 .PRG files
 *
 * http://fileformats.archiveteam.org/wiki/Commodore_64_binary_executable
 */
export const C64PrgAdapter: InternalAdapterDefinition = {
  label: 'C64 .PRG-File',
  name: 'c64prg',
  options: [shortpilotOption, c64machineOption, nameOption],
  identify,
  encode,
};

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.prg$/iu).exec(filename) !== null,
    header: undefined, // no specific header
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const name = options.getArgument(nameOption);
  if (name.length > 16) {
    throw new InvalidArgumentError(nameOption.name, 'Option name is expected to be a string of 16 characters maximum. Example: HELLOWORLD');
  }
  const header = ba.slice(0, 2);
  const loadAddress = header.getUint16Le(0);
  const data = ba.slice(2);
  const e = new C64Encoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.getArgument(c64machineOption),
  );
  e.begin();
  e.recordPrg(loadAddress, name.padEnd(16, ' '), data);
  e.end();
}
