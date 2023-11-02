import {ElectronEncoder} from '../encoder/ElectronEncoder.js';
import {BufferAccess} from '../../common/BufferAccess.js';
import {Logger} from '../../common/logging/Logger.js';
import {inflate} from 'pako';
import {InputDataError} from '../../common/Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const fileHeader = 'UEF File!\x00';
const compressedFileHeader = '\x1f\x8b';

/**
 * Adapter for Acorn Electron UEF files
 *
 * http://electrem.emuunlim.com/UEFSpecs.html
 */
const definition: AdapterDefinition = {

  name: 'Acorn Electron .UEF-File',

  internalName: 'uef',

  targetName: ElectronEncoder.getTargetName(),

  options: [],

  identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.uef/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader) || ba.containsDataAt(0, compressedFileHeader),
    };
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
    const uefBa = uncompressIfRequired(ba);

    if (!uefBa.containsDataAt(0, fileHeader)) {
      throw new InputDataError('File doesn\'t start with expected header.');
    }

    const uefVersionMinor = uefBa.getUint8(10);
    const uefVersionMajor = uefBa.getUint8(11);
    Logger.info(`UEF Version: ${uefVersionMajor}.${uefVersionMinor}`);

    const e = new ElectronEncoder(recorder);
    e.begin();

    let chunkOffset = 12;
    while (chunkOffset < uefBa.length()) {
      const chunkType = uefBa.getUint16Le(chunkOffset);
      const chunkLength = uefBa.getUint32Le(chunkOffset + 2);
      Logger.debug(`Chunk - Offset: 0x${chunkOffset.toString(16)} Type: 0x${chunkType.toString(16)} Length: 0x${chunkLength.toString(16)}`);
      const chunkBa = uefBa.slice(chunkOffset + 6, chunkLength);
      Logger.debug(chunkBa.asHexDump());
      switch (chunkType) {
        case 0x0000: // origin information chunk
        {
          const origin = chunkBa.slice(0, chunkBa.length() - 1).asAsciiString(); // remove trailing \0
          Logger.info(`Origin: ${origin}`);
          break;
        }
        case 0x0100: // implicit start/stop bit tape data block
          e.recordBytes(chunkBa);
          break;
        case 0x0104: // defined tape format data block
          // TODO "Emulator authors seeking simplicity may ignore any chunk that deals with the tape wave form at pulse or cycle level and rationalise chunk &0104 to a whole number of stop bits while retaining 99.9% compatibility with real world UEFs."
          Logger.error(`Chunk type 0x${chunkType.toString(16)} not implemented.`);
          break;
        case 0x0110: // carrier tone
          e.recordCarrier(chunkBa.getUint16Le(0));
          break;
        case 0x0112: // integer gap
          e.recordGap(chunkBa.getUint16Le(0));
          break;
        default:
          // TODO - try to support all 0x01xx (tape) chunks
          Logger.error(`Chunk type 0x${chunkType.toString(16)} not implemented.`);
      }

      chunkOffset += chunkLength + 6;
    }

    e.end();
  },
};
export default definition;

function uncompressIfRequired(ba: BufferAccess) {
  return ba.containsDataAt(0, compressedFileHeader) ? BufferAccess.createFromUint8Array(inflate(ba.asUint8Array())) : ba;
}
