import {AbstractAdapter} from './AbstractAdapter.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionValues} from '../Options.js';

const fileHeader = '\xc3KC-TAPE by AF.';

const fileHeaderLength = 16;
const blockSize = 128;
const fileBlockSize = 1 + blockSize; // 1 byte block number

export class KcTapAdapter extends AbstractAdapter {
  static getTargetName() {
    return KcEncoder.getTargetName();
  }

  static getName() {
    return 'KC .TAP-File';
  }

  static getInternalName() {
    return 'kctap';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.tap$/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const blocks = Math.ceil((ba.length() - fileHeaderLength) / fileBlockSize);

    // TODO: Possible warnings when:
    // - (data.length - fileHeaderLength) % fileBlockSize !== 0
    // - more than 255 blocks
    // - last block number not 0xff

    const e = new KcEncoder(recorder, options);

    e.begin();
    for (let i = 0; i < blocks; i++) {
      const fileOffset = fileHeaderLength + i * fileBlockSize;
      const dvBlock = ba.slice(fileOffset, fileBlockSize);
      const blockNumber = dvBlock.getUint8(0);
      const blockData = dvBlock.slice(1);
      e.recordBlock(blockNumber, blockData);
    }
    e.end();
  }
}
