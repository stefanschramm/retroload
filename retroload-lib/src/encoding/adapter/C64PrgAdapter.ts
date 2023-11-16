import {shortpilotOption, type OptionContainer} from '../Options.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type AdapterDefinition} from './AdapterDefinition.js';
import {type C64MachineType, c64machineOption} from './options/C64Options.js';

const definition: AdapterDefinition = {
  name: 'C64 .PRG-File',
  internalName: 'c64prg',
  targetName: C64Encoder.getTargetName(),
  options: [shortpilotOption, c64machineOption],
  identify,
  encode,
};
export default definition;

function identify(filename: string, _ba: BufferAccess) {
  return {
    filename: (/^.*\.prg$/i).exec(filename) !== null,
    header: undefined, // no specific header
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const machineType = options.getArgument(c64machineOption) as C64MachineType;
  const header = ba.slice(0, 2);
  const loadAddress = header.getUint16Le(0);
  const data = ba.slice(2);
  const e = new C64Encoder(recorder, options.isFlagSet(shortpilotOption), machineType);
  e.begin();
  e.recordPrg(loadAddress, ' '.repeat(16), data);
  e.end();
}
