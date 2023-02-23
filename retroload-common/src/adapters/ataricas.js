import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/atari.js';
import {InternalError} from '../exception.js';
import {Logger} from '../logger.js';

const fileHeader = 'FUJI';

export class AtariCasAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getInternalName() {
    return 'ataricas';
  }

  static getName() {
    return 'Atari .CAS-File';
  }

  /**
   * @param {string} filename
   * @param {BufferAccess} ba
   * @return {object}
   */
  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.cas/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  /**
   * @param {PcmRecorder|WaveRecorder} recorder
   * @param {BufferAccess} ba
   * @param {object} options
   */
  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    e.setDefaultBaudrate();
    let i = 0;
    while (i < ba.length()) {
      // determine block type
      const chunkBa = ba.slice(i);

      if (chunkBa.containsDataAt(0, 'FUJI')) {
        const chunkLength = chunkBa.getUint16LE(4);
        const tapeDescriptionBa = chunkBa.slice(8, chunkLength);
        Logger.debug(`AtariCasAdapter - tape description: ${tapeDescriptionBa.asAsciiString()}`);
        i += 8 + chunkLength;
      } else if (chunkBa.containsDataAt(0, 'baud')) {
        const chunkLength = chunkBa.getUint16LE(4);
        const baudRate = chunkBa.getUint16LE(6);
        e.setBaudrate(baudRate);
        Logger.debug(`AtariCasAdapter - type: baud, baudRate: ${baudRate}`);
        i += 8 + chunkLength;
      } else if (chunkBa.containsDataAt(0, 'data')) {
        const chunkLength = chunkBa.getUint16LE(4);
        const irgLength = chunkBa.getUint16LE(6);
        Logger.debug(`AtariCasAdapter - type: data, chunkLength: ${chunkLength}, irgLength: ${irgLength}`);
        const data = chunkBa.slice(8, chunkLength);
        e.recordData(irgLength, data);
        i += 8 + chunkLength;
      } else {
        throw new InternalError('Block type not implemented.');
        // TODO: Implement other block types: fsk, pwms, pwmc, pwmd, pwml
      }
    }
  }
}
