import {TzxProcessor} from './tzx/TzxProcessor.js';
import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer} from '../Options.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const fileHeader = 'ZXTape!\x1a';

const definition: AdapterDefinition = {

  name: 'ZX Spectrum .TZX-File',

  internalName: 'zxspectrumtzx',

  targetName: ZxSpectrumTzxEncoder.getTargetName(),

  options: [],

  identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.tzx/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new ZxSpectrumTzxEncoder(recorder, options);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  },
};
export default definition;
