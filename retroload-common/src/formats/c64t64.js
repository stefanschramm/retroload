import * as utils from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/c64.js';
// import {C64TapWriter as Encoder} from '../debug/c64_tap_writer.js';

const fileHeader = 'C64 tape image file';

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

  static encode(recorder, arrayBuffer, options) {
    const e = new Encoder(recorder);

    const header = new DataView(arrayBuffer, 0, 0x40);
    const entries = header.getUint16(0x24, true);

    e.begin();

    for (let entry = 0; entry < entries; entry++) {
      const entryLength = 0x20;
      const entryOffset = header.byteLength + (entry * entryLength);
      const entryInfo = new DataView(arrayBuffer, entryOffset, entryLength);
      const type = entryInfo.getUint8(0x00); // 0 = free, 1 = tape file, 2 = memory snapshot
      if (0 === type) {
        continue; // not interesting
      }
      const loadAddress = entryInfo.getUint16(0x02, true);
      const endAddress = entryInfo.getUint16(0x04, true);
      const dataLength = endAddress - loadAddress;
      const containerOffset = entryInfo.getUint16(0x08, true);
      const filename = new Uint8Array(arrayBuffer, entryOffset + 0x10, 0x10);
      const entryData = new Uint8Array(arrayBuffer, containerOffset, dataLength);
      e.recordPrg(loadAddress, filename, entryData);
    }

    e.end();
  }
}
