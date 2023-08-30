import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

/**
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
const definition: AdapterDefinition = {

  name: 'ZX Spectrum .TAP-File',

  internalName: 'zxspectrumtap',

  targetName: ZxSpectrumTzxEncoder.getTargetName(),

  options: [],

  identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.tap/i).exec(filename) !== null,
      header: undefined,
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new ZxSpectrumTzxEncoder(recorder, options);
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
  },
};
export default definition;
