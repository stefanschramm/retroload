import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TzxEncoder} from '../TzxEncoder.js';
import {TzxProcessor} from '../tzx/TzxProcessor.js';

/**
 * Adapter for ZX Spectrum .TZX files
 */
export const ZxSpectrumTzxAdapter: InternalAdapterDefinition = {
  label: 'ZX Spectrum .TZX-File',
  name: 'zxspectrumtzx',
  options: [],
  identify,
  encode,
};

const fileHeader = 'ZXTape!\x1a';

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.tzx/iu).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = TzxEncoder.createForZxSpectrum(recorder);
  const tzxProcessor = new TzxProcessor(e);
  tzxProcessor.processTzx(ba);
}
