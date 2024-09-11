import {TzxProcessor} from '../tzx/TzxProcessor.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {TzxEncoder} from '../TzxEncoder.js';

/**
 * Adapter for ZX Spectrum .TZX files
 */
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
  const e = TzxEncoder.createForZxSpectrum(recorder);
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
