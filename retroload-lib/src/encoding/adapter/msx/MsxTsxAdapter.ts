import {TzxProcessor} from '../tzx/TzxProcessor.js';
import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {ZxSpectrumTzxEncoder} from '../zxspectrum/ZxSpectrumTzxEncoder.js';

const definition: AdapterDefinition = {
  name: 'MSX .TSX-File',
  internalName: 'tsx',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'ZXTape!\x1a';

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.tsx/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = new ZxSpectrumTzxEncoder(recorder); // Looks like the ZX Spectrum frequencies (cycle factor) simply work...
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
