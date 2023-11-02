import {CpcTzxEncoder} from '../encoder/CpcTzxEncoder.js';
import {TzxProcessor} from './tzx/TzxProcessor.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const fileHeader = 'ZXTape!\x1a';

const definition: AdapterDefinition = {

  name: 'CPC .CDT-File',

  internalName: 'cdt',

  targetName: CpcTzxEncoder.getTargetName(),

  options: [],

  identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.cdt/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
    const e = new CpcTzxEncoder(recorder);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  },
};
export default definition;
