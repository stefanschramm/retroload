import {AbstractAdapter} from './AbstractAdapter.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileHeader = 'C64-TAPE-RAW';

const defaultLongPulse = 2048;

export class C64TapAdapter extends AbstractAdapter {
  static override getTargetName() {
    return C64Encoder.getTargetName();
  }

  static override getName() {
    return 'C64 .TAP-File';
  }

  static override getInternalName() {
    return 'c64tap';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.tap$/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const header = ba.slice(0, 0x14);
    const version = header.getUint8(0x0c);
    const dataLength = header.getUint32Le(0x10);

    Logger.debug(`C64TapAdapter - version: 0x${version.toString(16).padStart(2, '0')}, dataLength: ${dataLength}`);

    const data = ba.slice(header.length(), dataLength);
    const e = new C64Encoder(recorder, options);
    e.begin();
    for (let i = 0; i < data.length(); i += 1) {
      const value = data.getUint8(i);
      let pulseLength: number;
      if (value === 0) {
        // Long pulse
        if (version === 0) {
          pulseLength = defaultLongPulse;
        } else {
          pulseLength = data.getUint8(i + 1) + data.getUint8(i + 2) * 256 + data.getUint8(i + 3) * 65536;
          i += 3;
        }
      } else {
        // Usual pulse
        pulseLength = 8 * value;
      }
      e.recordPulse(pulseLength);
    }
    e.end();
  }
}
