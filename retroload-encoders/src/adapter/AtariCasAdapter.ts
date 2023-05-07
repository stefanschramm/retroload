import {AbstractAdapter} from './AbstractAdapter.js';
import {AtariEncoder} from '../encoder/AtariEncoder.js';
import {InternalError} from '../Exceptions.js';
import {Logger} from '../Logger.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from 'retroload-common';
import {type OptionContainer} from '../Options.js';

const fileHeader = 'FUJI';

export class AtariCasAdapter extends AbstractAdapter {
  static override getTargetName() {
    return AtariEncoder.getTargetName();
  }

  static override getInternalName() {
    return 'ataricas';
  }

  static override getName() {
    return 'Atari .CAS-File';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.cas/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new AtariEncoder(recorder, options);
    e.setDefaultBaudrate();
    let i = 0;
    while (i < ba.length()) {
      // determine block type
      const chunkBa = ba.slice(i);

      if (chunkBa.containsDataAt(0, 'FUJI')) {
        const chunkLength = chunkBa.getUint16Le(4);
        const tapeDescriptionBa = chunkBa.slice(8, chunkLength);
        Logger.debug(`AtariCasAdapter - tape description: ${tapeDescriptionBa.asAsciiString()}`);
        i += 8 + chunkLength;
      } else if (chunkBa.containsDataAt(0, 'baud')) {
        const chunkLength = chunkBa.getUint16Le(4);
        const baudRate = chunkBa.getUint16Le(6);
        e.setBaudrate(baudRate);
        Logger.debug(`AtariCasAdapter - type: baud, baudRate: ${baudRate}`);
        i += 8 + chunkLength;
      } else if (chunkBa.containsDataAt(0, 'data')) {
        const chunkLength = chunkBa.getUint16Le(4);
        const irgLength = chunkBa.getUint16Le(6);
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
