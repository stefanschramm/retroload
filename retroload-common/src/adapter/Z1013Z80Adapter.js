import {AbstractAdapter} from './AbstractAdapter.js';
import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {Logger} from '../Logger.js';

const headerLength = 0x20;

export class Z1013Z80Adapter extends AbstractAdapter {
  static getTargetName() {
    return Z1013Encoder.getTargetName();
  }

  static getName() {
    return 'Z1013 .Z80-File (Headersave)';
  }

  static getInternalName() {
    return 'z1013z80';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.z80$/i) !== null,
      header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
    };
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
    const e = new Z1013Encoder(recorder);
    e.begin();
    e.recordData(data);
    e.end();
  }
}
