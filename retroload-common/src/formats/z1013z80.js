import {containsDataAt} from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/z1013.js';

export function getName() {
  return 'Z1013 .Z80-File (Headersave)';
}

export function getInternalName() {
  return 'z1013z80';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.z80$/i) !== null,
    header: containsDataAt(dataView, 0x0d, [0xd3, 0xd3, 0xd3]),
  };
}

export function getAdapters() {
  return [Adapter];
}

const headerLength = 0x20;

class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, dataView, options) {
    const header = dataView.referencedSlice(0, headerLength);
    const data = dataView.referencedSlice(headerLength);
    const loadAddress = header.getUint16(0x00, true);
    const endAddress = header.getUint16(0x02, true);
    const startAddress = header.getUint16(0x04, true);
    const type = header.getUint8(0x0c);
    const name = (new TextDecoder()).decode(new Uint8Array(dataView, 0x10, 0x10));
    console.log(`Filename: "${name.toString(16)}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
    const e = new Encoder(recorder);
    e.begin();
    e.recordData(data);
    e.end();
  }
}
