import {TzxProcessor} from '../tzx/TzxProcessor.js';
import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {TzxEncoder} from '../TzxEncoder.js';

const definition: AdapterDefinition = {
  name: 'CPC .CDT-File',
  internalName: 'cdt',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'ZXTape!\x1a';

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.cdt/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = TzxEncoder.createForCpc(recorder);
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
