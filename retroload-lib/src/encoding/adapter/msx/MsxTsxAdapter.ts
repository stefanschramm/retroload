import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TzxEncoder} from '../TzxEncoder.js';
import {TzxProcessor} from '../tzx/TzxProcessor.js';

export const MsxTsxAdapter: InternalAdapterDefinition = {
  label: 'MSX .TSX-File',
  name: 'tsx',
  options: [],
  identify,
  encode,
};

const fileHeader = 'ZXTape!\x1a';

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.tsx/iu).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = TzxEncoder.createForZxSpectrum(recorder); // Looks like the ZX Spectrum frequencies (cycle factor) simply work...
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
