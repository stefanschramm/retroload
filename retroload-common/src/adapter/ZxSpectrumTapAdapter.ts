import {AbstractAdapter} from './AbstractAdapter.js';
import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionValues} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

/**
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
export class ZxSpectrumTapAdapter extends AbstractAdapter {
  static getTargetName() {
    return ZxSpectrumTzxEncoder.getTargetName();
  }

  static getName() {
    return 'ZX Spectrum .TAP-File';
  }

  static getInternalName() {
    return 'zxspectrumtap';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.tap/i) !== null,
      header: undefined,
    };
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new ZxSpectrumTzxEncoder(recorder, options);
    e.begin();
    let i = 0;
    while (i < ba.length()) {
      const dataLength = ba.getUint16LE(i);
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
