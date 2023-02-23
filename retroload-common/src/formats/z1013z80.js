import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/z1013.js';
import {Logger} from '../logger.js';

export function getName() {
  return 'Z1013 .Z80-File (Headersave)';
}

export function getInternalName() {
  return 'z1013z80';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.z80$/i) !== null,
    header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
  };
}

export function getAdapters() {
  return [Z1013Z80Adapter];
}

const headerLength = 0x20;

class Z1013Z80Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const header = ba.slice(0, headerLength);
    const data = ba.slice(headerLength);
    const loadAddress = header.getUint16LE(0x00);
    const endAddress = header.getUint16LE(0x02);
    const startAddress = header.getUint16LE(0x04);
    const type = header.getUint8(0x0c);
    const name = (new TextDecoder()).decode(new Uint8Array(ba, 0x10, 0x10));
    Logger.log(`Filename: "${name.toString(16)}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
    const e = new Encoder(recorder);
    e.begin();
    e.recordData(data);
    e.end();
  }
}
