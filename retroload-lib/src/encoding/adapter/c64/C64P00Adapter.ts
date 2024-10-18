import {shortpilotOption, type OptionContainer} from '../../Options.js';
import {C64Encoder} from './C64Encoder.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {c64machineOption} from './C64Options.js';

/**
 * Adapter for C64 .P00 files
 *
 * http://unusedino.de/ec64/technical/formats/pc64.html
 */
const definition: InternalAdapterDefinition = {
  label: 'C64 .P00-File',
  name: 'c64p00',
  options: [shortpilotOption, c64machineOption],
  identify,
  encode,
};
export default definition;

const fileHeader = 'C64File';

// We support p00 only, not multiple parts (p01, ...)
function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.p00$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const fileName = ba.slice(8, 0x10);
  const loadAddress = ba.getUint16Le(0x1a);
  const data = ba.slice(0x1c);
  const e = new C64Encoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.getArgument(c64machineOption),
  );
  e.begin();
  e.recordPrg(loadAddress, fileName.asAsciiString(), data);
  e.end();
}
