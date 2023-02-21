import {Mo5Encoder} from '../encoder/Mo5Encoder.js';
import {AbstractAdapter} from './AbstractAdapter.js';
import {Logger} from '../Logger.js';
import {InputDataError} from '../Exceptions.js';

const fileHeader = [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x3C, 0x5A];
const constantHeaderSize = 18;

export class Mo5K7Adapter extends AbstractAdapter {
  static getTargetName() {
    return Mo5Encoder.getTargetName();
  }

  static getName() {
    return 'MO5 .K7-File';
  }

  static getInternalName() {
    return 'mo5k7';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.k7/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder, ba, options) {
    const e = new Mo5Encoder(recorder, options);
    e.begin();
    let i = 0;
    while (i < ba.length()) {
      const headerBa = ba.slice(i + constantHeaderSize);
      const blockType = headerBa.getUint8(0);
      Logger.debug(`Block type: 0x${blockType.toString(16)}`);
      const blockLengthField = headerBa.getUint8(1);

      let blockToRecord = null;
      switch (blockType) {
        case 0x00: // start block
          blockToRecord = ba.slice(i, constantHeaderSize + 1 + blockLengthField);
          Logger.debug(blockToRecord.asHexDump());
          e.recordStartBlock(blockToRecord);
          break;
        case 0x01: // data block
          const actualBlockLength = blockLengthField === 0x00 ? 0xff : (blockLengthField - 1);
          blockToRecord = ba.slice(i, constantHeaderSize + 2 + actualBlockLength);
          Logger.debug(blockToRecord.asHexDump());
          e.recordDataBlock(blockToRecord);
          break;
        case 0xff: // end block
          blockToRecord = ba.slice(i, constantHeaderSize + 3);
          Logger.debug(blockToRecord.asHexDump());
          e.recordEndBlock(blockToRecord);
          break;
        default:
          throw new InputDataError(`Unknown blocktype: 0x${blockType.toString(16)}`);
      }
      if (blockToRecord.length() === 0) {
        throw new InputDataError('Read invalid block size.'); // prevents infinite looping
      }
      i += blockToRecord.length();
    }
    e.end();
  }
}
