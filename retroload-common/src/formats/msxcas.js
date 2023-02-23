import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/msx.js';
import {Logger} from '../logger.js';

const blockHeader = [0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74];

export function getName() {
  return 'MSX .CAS-File';
}

export function getInternalName() {
  return 'msxcas';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.cas$/i) !== null,
    header: ba.containsDataAt(0, blockHeader),
  };
}

export function getAdapters() {
  return [MsxCasAdapter];
}

const typeHeaderLength = 10;
const headerTypes = {
  binary: Array(typeHeaderLength).fill(0xd0),
  basic: Array(typeHeaderLength).fill(0xd3),
  ascii: Array(typeHeaderLength).fill(0xea),
};

export class MsxCasAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return Encoder.getOptions();
  }

  static encode(recorder, ba, options) {
    const e = new Encoder(recorder, options);
    e.begin();
    for (let i = 0; i < ba.length(); i++) {
      if (i % 8 === 0 && ba.containsDataAt(i, blockHeader)) {
        const blockHeaderPosition = i;
        i += blockHeader.length;
        const type = this.determineType(ba, i);
        const long = ['binary', 'basic', 'ascii'].indexOf(type) !== -1;
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
