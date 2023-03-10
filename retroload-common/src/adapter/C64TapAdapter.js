import {AbstractAdapter} from './AbstractAdapter.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {Logger} from '../Logger.js';

const fileHeader = 'C64-TAPE-RAW';

const defaultLongPulse = 2048;

export class C64TapAdapter extends AbstractAdapter {
  static getTargetName() {
    return C64Encoder.getTargetName();
  }

  static getName() {
    return 'C64 .TAP-File';
  }

  static getInternalName() {
    return 'c64tap';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.tap$/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder, ba, options) {
    const header = ba.slice(0, 0x14);
    const version = header.getUint8(0x0c);
    const dataLength = header.getUint32LE(0x10);

    Logger.debug(`C64TapAdapter - version: 0x${version.toString(16).padStart(2, 0)}, dataLength: ${dataLength}`);

    const data = ba.slice(header.length(), dataLength);
    const e = new C64Encoder(recorder);
    e.begin();
    for (let i = 0; i < data.length(); i += 1) {
      const value = data.getUint8(i);
      let pulseLength;
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
