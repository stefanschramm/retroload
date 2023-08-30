import {InputDataError} from '../../common/Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {TiEncoder} from '../encoder/TiEncoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

const blockSize = 64;

export class TiGenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return TiEncoder.getTargetName();
  }

  static override getName() {
    return 'TI-99/4A (Generic)';
  }

  static override getInternalName(): string {
    return 'tigeneric';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  }

  static override getOptions() {
    return [];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
  }
}
