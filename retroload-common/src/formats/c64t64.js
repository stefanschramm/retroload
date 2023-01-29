import * as utils from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/c64.js';
import {ShortpilotOption} from '../option.js';

// Usually 'C64 tape image file' but might be different
const fileHeader = 'C64';

export function getName() {
  return 'C64 .T64-File';
}

export function getInternalName() {
  return 'c64t64';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.t64$/i) !== null,
    header: utils.containsDataAt(dataView, 0, fileHeader),
  };
}

export function getAdapters() {
  return [Adapter];
}

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
    ];
  }

  // http://unusedino.de/ec64/technical/formats/t64.html
  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder);

    const header = dataView.referencedSlice(0, 0x40);
    const entries = header.getUint16(0x24, true);

    e.begin();

    for (let entry = 0; entry < entries; entry++) {
      const entryLength = 0x20;
      const entryOffset = header.byteLength + (entry * entryLength);
      const entryInfo = dataView.referencedSlice(entryOffset, entryLength);
      const type = entryInfo.getUint8(0x00); // 0 = free, 1 = tape file, 2 = memory snapshot
      if (0 === type) {
        continue; // not interesting
      }
      const loadAddress = entryInfo.getUint16(0x02, true);
      const endAddress = entryInfo.getUint16(0x04, true);
      const dataLength = endAddress - loadAddress;
      const containerOffset = entryInfo.getUint32(0x08, true);
      const filename = dataView.referencedSlice(entryOffset + 0x10, 0x10);
      const entryData = dataView.referencedSlice(containerOffset, dataLength);
      e.recordPrg(loadAddress, filename.asAsciiString(), entryData);
    }

    e.end();
  }
}
