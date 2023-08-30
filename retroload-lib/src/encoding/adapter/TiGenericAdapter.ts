import {InputDataError} from '../../common/Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {TiEncoder} from '../encoder/TiEncoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const blockSize = 64;

const definition: AdapterDefinition = {

  name: 'TI-99/4A (Generic)',

  internalName: 'tigeneric',

  targetName: TiEncoder.getTargetName(),

  options: [],

  identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    if (ba.length() % blockSize !== 0) {
      Logger.info(`Length of data is not a multiple of ${blockSize} bytes. Last block will be padded with 0.`);
    }
    const blocks = ba.chunksPadded(64);
    if (blocks.length > 255) {
      throw new InputDataError('File contains too many blocks.');
    }
    const e = new TiEncoder(recorder, options);
    e.begin();
    e.recordHeader(blocks.length);
    for (const block of blocks) {
      e.recordBlock(block);
    }
    e.end();
  },
};
export default definition;
