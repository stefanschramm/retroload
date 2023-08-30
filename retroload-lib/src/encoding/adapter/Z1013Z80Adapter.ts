import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type OptionContainer} from '../Options.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const headerLength = 0x20;

const definition: AdapterDefinition = {

  name: 'Z1013 .Z80-File (Headersave)',

  internalName: 'z80',

  targetName: Z1013Encoder.getTargetName(),

  options: [],

  identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.z80$/i).exec(filename) !== null,
      header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const header = ba.slice(0, headerLength);
    const data = ba.slice(headerLength);
    const loadAddress = header.getUint16Le(0x00);
    const endAddress = header.getUint16Le(0x02);
    const startAddress = header.getUint16Le(0x04);
    const type = header.getUint8(0x0c);
    const name = ba.slice(0x10, 0x10).asAsciiString();
    Logger.log(`Filename: "${name}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
    const e = new Z1013Encoder(recorder, options);
    e.begin();
    e.recordData(data);
    e.end();
  },
};
export default definition;
