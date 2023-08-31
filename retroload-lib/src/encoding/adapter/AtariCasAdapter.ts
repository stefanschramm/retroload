import {AtariEncoder} from '../encoder/AtariEncoder.js';
import {InternalError} from '../../common/Exceptions.js';
import {Logger} from '../../common/logging/Logger.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer} from '../Options.js';
import {type AdapterDefinition, type FormatIdentification} from './AdapterDefinition.js';

const fileHeader = 'FUJI';

const definition: AdapterDefinition = {

  name: 'Atari .CAS-File',

  internalName: 'ataricas',

  targetName: AtariEncoder.getTargetName(),

  options: [],

  identify(filename: string, ba: BufferAccess): FormatIdentification {
    return {
      filename: (/^.*\.cas/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
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
  },

};
export default definition;
