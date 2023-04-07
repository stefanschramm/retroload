import {AbstractAdapter} from './AbstractAdapter.js';
import {MsxEncoder} from '../encoder/MsxEncoder.js';
import {Logger} from '../Logger.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionValues} from '../Options.js';

const blockHeader = [0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74];

const typeHeaderLength = 10;
const headerTypes = {
  binary: Array(typeHeaderLength).fill(0xd0),
  basic: Array(typeHeaderLength).fill(0xd3),
  ascii: Array(typeHeaderLength).fill(0xea),
};

export class MsxCasAdapter extends AbstractAdapter {
  static getTargetName() {
    return MsxEncoder.getTargetName();
  }

  static getName() {
    return 'MSX .CAS-File';
  }

  static getInternalName() {
    return 'msxcas';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.cas$/i) !== null,
      header: ba.containsDataAt(0, blockHeader),
    };
  }

  static getOptions() {
    return MsxEncoder.getOptions();
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new MsxEncoder(recorder, options);
    e.begin();
    for (let i = 0; i < ba.length(); i++) {
      if (i % 8 === 0 && ba.containsDataAt(i, blockHeader)) {
        const blockHeaderPosition = i;
        i += blockHeader.length;
        const type = this.determineType(ba, i);
        const long = (['binary', 'basic', 'ascii'] as Array<string | undefined>).includes(type);
        Logger.debug('MsxCasAdapter - block header at\t0x' + (blockHeaderPosition).toString(16).padStart(4, '0') + '\t type: ' + type);
        e.recordHeader(long);
      }
      e.recordByte(ba.getUint8(i));
    }
    e.end();
  }

  static determineType(dataBa, offset) {
    for (const [type, header] of Object.entries(headerTypes)) {
      if (dataBa.containsDataAt(offset, header)) {
        return type;
      }
    }

    return undefined; // unknown
  }
}
