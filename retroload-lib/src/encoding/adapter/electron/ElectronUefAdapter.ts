import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {inflate} from 'pako';
import {InputDataError} from '../../../common/Exceptions.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {UefProcessor} from './UefProcessor.js';

/**
 * Adapter for Acorn Electron .UEF files
 *
 * http://electrem.emuunlim.com/UEFSpecs.html
 */
const definition: InternalAdapterDefinition = {
  name: 'Acorn Electron .UEF-File',
  internalName: 'uef',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'UEF File!\x00';
const compressedFileHeader = '\x1f\x8b';

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.uef/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader) || ba.containsDataAt(0, compressedFileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const uefBa = uncompressIfRequired(ba);

  if (!uefBa.containsDataAt(0, fileHeader)) {
    throw new InputDataError('File doesn\'t start with expected header.');
  }

  const uefVersionMinor = uefBa.getUint8(10);
  const uefVersionMajor = uefBa.getUint8(11);
  Logger.info(`UEF Version: ${uefVersionMajor}.${uefVersionMinor}`);

  const uefProcessor = new UefProcessor(recorder);
  uefProcessor.processUef(uefBa);
}

function uncompressIfRequired(ba: BufferAccess): BufferAccess {
  return ba.containsDataAt(0, compressedFileHeader) ? BufferAccess.createFromUint8Array(inflate(ba.asUint8Array())) : ba;
}

