import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type OptionContainer} from '../Options.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

/**
 * The .z80 adapter currently just strips the header and outputs the acutal
 * data like from a .z13 (generic) file. Thus using headersave for loading
 * is not possible and the ROM routines need to be used for loading, specifying
 * the memory addresses manually.
 *
 * TODO: Implement option for enabling real headersave output.
 */
const definition: AdapterDefinition = {
  name: 'Z1013 .Z80-File (Headersave)',
  internalName: 'z80',
  targetName: Z1013Encoder.getTargetName(),
  options: [],
  identify,
  encode,
};
export default definition;

const headerLength = 0x20;

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.z80$/i).exec(filename) !== null,
    header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const header = ba.slice(0, headerLength);
  const data = ba.slice(headerLength);
  const loadAddress = header.getUint16Le(0x00);
  const endAddress = header.getUint16Le(0x02);
  const startAddress = header.getUint16Le(0x04);
  const type = header.getUint8(0x0c);
  const name = ba.slice(0x10, 0x10).asAsciiString();
  Logger.log(`Filename: "${name}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
  const e = new Z1013Encoder(recorder);
  e.begin();
  e.recordData(data);
  e.end();
}
