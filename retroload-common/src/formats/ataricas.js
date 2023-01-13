import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/atari.js';
import {containsDataAt} from '../utils.js';

const fileHeader = 'FUJI';

export function getName() {
  return 'Atari .CAS-File';
}

export function getInternalName() {
  return 'ataricas';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.cas/i) !== null,
    header: containsDataAt(dataView, 0, fileHeader),
  };
}

export function getAdapters() {
  return [Adapter];
}

class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder);
    let baudRate = 600;
    let i = 0;
    while (i < dataView.byteLength) {
      // determine block type
      const chunkDv = dataView.referencedSlice(i);

      if (containsDataAt(chunkDv, 0, 'FUJI')) {
        const chunkLength = chunkDv.getUint16(4, true);
        i += 8 + chunkLength;
      } else if (containsDataAt(chunkDv, 0, 'baud')) {
        const chunkLength = chunkDv.getUint16(4, true);
        baudRate = chunkDv.getUint16(6, true);
        i += 8 + chunkLength;
      } else if (containsDataAt(chunkDv, 0, 'data')) {
        const chunkLength = chunkDv.getUint16(4, true);
        const irgLength = chunkDv.getUint16(6, true);
        const data = chunkDv.referencedSlice(8, chunkLength);
        e.recordData(baudRate, irgLength, data);
        i += 8 + chunkLength;
      } else {
        throw new Error('Block type not implemented.');
      }
    }
  }
}
