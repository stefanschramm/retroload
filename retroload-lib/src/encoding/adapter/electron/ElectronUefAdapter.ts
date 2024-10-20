import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {UefProcessor} from './UefProcessor.js';
import {inflate} from 'pako';

/**
 * Adapter for Acorn Electron .UEF files
 *
 * http://electrem.emuunlim.com/UEFSpecs.html
 */
export const ElectronUefAdapter: InternalAdapterDefinition = {
  label: 'Acorn Electron .UEF-File',
  name: 'uef',
  options: [],
  identify,
  encode,
};

const fileHeader = 'UEF File!\x00';
const compressedFileHeader = '\x1f\x8b';

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.uef/iu).exec(filename) !== null,
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

