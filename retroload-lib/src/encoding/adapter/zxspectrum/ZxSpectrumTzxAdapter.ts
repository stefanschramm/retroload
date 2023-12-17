import {TzxProcessor} from '../tzx/TzxProcessor.js';
import {ZxSpectrumTzxEncoder} from './ZxSpectrumTzxEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

const definition: AdapterDefinition = {
  name: 'ZX Spectrum .TZX-File',
  internalName: 'zxspectrumtzx',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'ZXTape!\x1a';

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.tzx/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = new ZxSpectrumTzxEncoder(recorder);
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
