import {AbstractAdapter, unidentifiable} from './AbstractAdapter.js';
import {InputDataError} from '../../common/Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {TiEncoder} from '../encoder/TiEncoder.js';

const blockSize = 64;

export class TiFiadAdapter extends AbstractAdapter {
  static override getTargetName() {
    return TiEncoder.getTargetName();
  }

  static override getName() {
    return 'TI-99/4A .FIAD-File';
  }

  static override getInternalName() {
    return 'fiad';
  }

  static override identify(_filename: string, _ba: BufferAccess) {
    return unidentifiable;
  }

  static override getOptions() {
    return [];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    if (ba.length() < 2 * blockSize) {
      throw new InputDataError(`FIAD files need to be of a size at least ${2 * blockSize} bytes.`);
    }
    if (ba.length() % blockSize !== 0) {
      throw new InputDataError(`Length of data in FIAD file is not a multiple of ${blockSize} bytes.`);
    }
    const blocks = ba.slice(2 * blockSize).chunks(64); // first 128 bytes are skipped
    if (blocks.length > 255) {
      throw new InputDataError('FIAD file contains too many blocks.');
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
