import {containsDataAt} from '../utils.js';
import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/msx.js';

const blockHeader = [0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74];

export function getName() {
  return 'MSX .CAS-File';
}

export function getInternalName() {
  return 'msxcas';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.cas$/i) !== null,
    header: containsDataAt(dataView, 0, blockHeader),
  };
}

export function getAdapters() {
  return [Adapter];
}

const typeHeaderLength = 10;
const headerTypes = {
  binary: Array(typeHeaderLength).fill(0xd0),
  basic: Array(typeHeaderLength).fill(0xd3),
  ascii: Array(typeHeaderLength).fill(0xea),
};

class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return Encoder.getOptions();
  }

  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder, options);
    e.begin();
    for (let i = 0; i < dataView.byteLength; i++) {
      if (i % 8 === 0 && containsDataAt(dataView, i, blockHeader)) {
        const blockHeaderPosition = i;
        i += blockHeader.length;
        const type = this.determineType(dataView, i);
        const long = ['binary', 'basic', 'ascii'].indexOf(type) !== -1;
        console.log('Block header at\t0x' + (blockHeaderPosition).toString(16) + '\t type: ' + type);
        e.recordHeader(long);
      }
      e.recordByte(dataView.getUint8(i));
    }
    e.end();
  }

  static determineType(data, offset) {
    for (const [type, header] of Object.entries(headerTypes)) {
      if (containsDataAt(data, offset, header)) {
        return type;
      }
    }

    return undefined; // unknown
  }
}
