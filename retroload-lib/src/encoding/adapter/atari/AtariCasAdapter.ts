import {AtariEncoder} from './AtariEncoder.js';
import {InputDataError, InternalError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type InternalAdapterDefinition, type FormatIdentification} from '../AdapterDefinition.js';

const fileHeader = 'FUJI';

/**
 * Adapter for Atari CAS files
 *
 * https://a8cas.sourceforge.net/format-cas.html
 */
const definition: InternalAdapterDefinition = {
  name: 'Atari .CAS-File',
  internalName: 'ataricas',
  options: [],
  identify,
  encode,
};
export default definition;

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.cas/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new AtariEncoder(recorder);
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
    } else if (chunkBa.containsDataAt(0, 'fsk ')) {
      throwUnimplementedError('fsk');
    } else if (chunkBa.containsDataAt(0, 'pwms')) {
      throwUnimplementedError('pwms');
    } else if (chunkBa.containsDataAt(0, 'pwmc')) {
      throwUnimplementedError('pwmc');
    } else if (chunkBa.containsDataAt(0, 'pwmd')) {
      throwUnimplementedError('pwmd');
    } else if (chunkBa.containsDataAt(0, 'pwml')) {
      throwUnimplementedError('pwml');
    } else {
      throw new InputDataError('Encountered unknown chunk type.');
    }
  }
}

function throwUnimplementedError(blockType: string): void {
  throw new InternalError(`Block type ${blockType} not implemented. Unable to convert this file.`);
}
