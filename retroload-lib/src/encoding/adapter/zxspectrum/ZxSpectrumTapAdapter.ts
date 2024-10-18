import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {TzxEncoder} from '../TzxEncoder.js';

/**
 * Adapter for ZX Spectrum .TAP files
 *
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
const definition: InternalAdapterDefinition = {
  label: 'ZX Spectrum .TAP-File',
  name: 'zxspectrumtap',
  options: [],
  identify,
  encode,
};
export default definition;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.tap/i).exec(filename) !== null,
    header: undefined,
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = TzxEncoder.createForZxSpectrum(recorder);
  e.begin();
  let i = 0;
  while (i < ba.length()) {
    const dataLength = ba.getUint16Le(i);
    if (dataLength === 0) {
      break; // There might be garbage(-zeros) at the end
    }
    i += 2;
    e.recordStandardSpeedDataBlock(ba.slice(i, dataLength));
    i += dataLength;
  }
  e.end();
}
