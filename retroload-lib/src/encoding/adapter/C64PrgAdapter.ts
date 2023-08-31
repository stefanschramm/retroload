import {shortpilotOption, type OptionContainer} from '../Options.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
// import {C64TapWriter as C64Encoder} from '../debug/C64TapWriter.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const definition: AdapterDefinition = {

  name: 'C64 .PRG-File',

  internalName: 'c64prg',

  targetName: C64Encoder.getTargetName(),

  options: [
    shortpilotOption, // (not available for .tap)
  ],

  identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.prg$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const header = ba.slice(0, 2);
    const loadAddress = header.getUint16Le(0);
    const data = ba.slice(2);
    const e = new C64Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, ' '.repeat(16), data, options.isFlagSet(shortpilotOption));
    e.end();
  },
};
export default definition;
