import {AbstractAdapter} from './AbstractAdapter.js';
import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {Logger} from '../Logger.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionValues} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

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

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const header = ba.slice(0, headerLength);
    const data = ba.slice(headerLength);
    const loadAddress = header.getUint16LE(0x00);
    const endAddress = header.getUint16LE(0x02);
    const startAddress = header.getUint16LE(0x04);
    const type = header.getUint8(0x0c);
    const name = ba.slice(0x10, 0x10).asAsciiString();
    Logger.log(`Filename: "${name}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
    const e = new Z1013Encoder(recorder, options);
    e.begin();
    e.recordData(data);
    e.end();
  }
}
