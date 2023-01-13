import * as utils from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/c64.js';

const fileHeader = 'C64-TAPE-RAW';

export function getName() {
  return 'C64 .TAP-File';
}

export function getInternalName() {
  return 'c64tap';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.tap$/i) !== null,
    header: utils.containsDataAt(dataView, 0, fileHeader),
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

  static encode(recorder, dataView, options) {
    const header = dataView.referencedSlice(0, 0x14);
    const version = header.getUint8(0x0c);
    const dataLength = header.getUint32(0x10, true);
    const data = dataView.referencedSlice(header.byteLength, dataLength);
    const e = new Encoder(recorder);
    e.begin();
    for (let i = 0; i < data.byteLength; i += 1) {
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
