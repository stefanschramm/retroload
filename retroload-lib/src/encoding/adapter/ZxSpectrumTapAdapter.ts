import {AbstractAdapter} from './AbstractAdapter.js';
import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

/**
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
export class ZxSpectrumTapAdapter extends AbstractAdapter {
  static override getTargetName() {
    return ZxSpectrumTzxEncoder.getTargetName();
  }

  static override getName() {
    return 'ZX Spectrum .TAP-File';
  }

  static override getInternalName() {
    return 'zxspectrumtap';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.tap/i).exec(filename) !== null,
      header: undefined,
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
  }
}
