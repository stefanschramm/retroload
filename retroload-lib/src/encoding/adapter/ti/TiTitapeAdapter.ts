import {InputDataError} from '../../../common/Exceptions.js';
import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TiEncoder} from './TiEncoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for TI-99/4A .TITape files
 *
 * A .TITape archive can contain several files. They will be appended one after another.
 * When playing, it's probably required to press pause in between the individual files.
 */
const definition: AdapterDefinition = {
  name: 'TI-99/4A .TITape-File',
  internalName: 'titape',
  options: [],
  identify,
  encode,
};
export default definition;

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.titape$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, 'TI-TAPE'),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const length = ba.getUint32Le(0x0c);
  const dataLength = ba.getUint16Le(0x10);
  const filesBa = ba.slice(0x10);
  if (filesBa.length() !== length) {
    Logger.info(`Data length field in header ${dataLength} does not match actual length of remaining data (${filesBa.length()}).`);
  }
  const e = new TiEncoder(recorder);
  e.begin();
  let filesBaOffset = 0;
  while (filesBaOffset < filesBa.length()) {
    const fileLength = filesBa.getUint16Le(filesBaOffset);
    // There are another two bytes of unknown purpose.
    const fileDataBa = filesBa.slice(4, fileLength);
    const blocks = fileDataBa.chunksPadded(64);
    if (blocks.length > 255) {
      throw new InputDataError('TITape file contains too many blocks.');
    }
    e.recordHeader(blocks.length);
    for (const block of blocks) {
      e.recordBlock(block);
    }
    filesBaOffset += 4 + fileLength;
  }
  e.end();
}
