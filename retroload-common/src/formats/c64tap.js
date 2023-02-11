import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/c64.js';
import {Logger} from '../logger.js';

const fileHeader = 'C64-TAPE-RAW';

export function getName() {
  return 'C64 .TAP-File';
}

export function getInternalName() {
  return 'c64tap';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.tap$/i) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

export function getAdapters() {
  return [Adapter];
}

const defaultLongPulse = 2048;

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const header = ba.slice(0, 0x14);
    const version = header.getUint8(0x0c);
    const dataLength = header.getUint32LE(0x10);

    Logger.debug(`C64TapAdapter - version: 0x${version.toString(16).padStart(2, 0)}, dataLength: ${dataLength}`);

    const data = ba.slice(header.length(), dataLength);
    const e = new Encoder(recorder);
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
