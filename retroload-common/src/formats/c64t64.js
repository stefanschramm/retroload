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

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.t64$/i) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

export function getAdapters() {
  return [C64T64Adapter];
}

export class C64T64Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return [
      ShortpilotOption, // (not available for .tap)
    ];
  }

  // http://unusedino.de/ec64/technical/formats/t64.html
  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);

    const header = ba.slice(0, 0x40);
    const entries = header.getUint16LE(0x24);

    e.begin();

    for (let entry = 0; entry < entries; entry++) {
      const entryLength = 0x20;
      const entryOffset = header.length() + (entry * entryLength);
      const entryInfo = ba.slice(entryOffset, entryLength);
      const type = entryInfo.getUint8(0x00); // 0 = free, 1 = tape file, 2 = memory snapshot
      if (0 === type) {
        continue; // not interesting
      }
      const loadAddress = entryInfo.getUint16LE(0x02);
      const endAddress = entryInfo.getUint16LE(0x04);
      const dataLength = endAddress - loadAddress;
      const containerOffset = entryInfo.getUint32LE(0x08);
      const filename = ba.slice(entryOffset + 0x10, 0x10);
      const entryData = ba.slice(containerOffset, dataLength);
      e.recordPrg(loadAddress, filename.asAsciiString(), entryData);
    }

    e.end();
  }
}
