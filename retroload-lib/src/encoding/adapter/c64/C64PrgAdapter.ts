import {shortpilotOption, type OptionContainer, nameOption} from '../../Options.js';
import {C64Encoder} from './C64Encoder.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {c64machineOption} from './C64Options.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';

/**
 * Adapter for C64 .PRG files
 *
 * http://fileformats.archiveteam.org/wiki/Commodore_64_binary_executable
 */
const definition: InternalAdapterDefinition = {
  label: 'C64 .PRG-File',
  name: 'c64prg',
  options: [shortpilotOption, c64machineOption, nameOption],
  identify,
  encode,
};
export default definition;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.prg$/i).exec(filename) !== null,
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
