import type {BufferAccess} from '../BufferAccess.js';
import {Mo5Encoder} from '../encoder/Mo5Encoder.js';
import {AbstractAdapter} from './AbstractAdapter.js';
import {Logger} from '../Logger.js';
import {InputDataError} from '../Exceptions.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type OptionValues} from '../Options.js';

// the number of 0x01 in the header seems to vary; many images have 64, 16 and some less...
const fileHeader = [0x01, 0x01, 0x01, 0x01];

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

  static identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.k7/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new Mo5Encoder(recorder, options);
    e.begin();
    let i = 0;
    let blockType: number | undefined;
    while (i < ba.length()) {
      let headerOffset = 0;
      if (ba.getUint8(i) !== 0x01 && blockType === 0xff) {
        // End block has already been recorded: ignore remaining garbage in file
        break;
      }
      while (ba.getUint8(i + headerOffset) === 0x01) {
        headerOffset++; // the number of intro bytes seems to vary
      }
      if (ba.getUint8(i + headerOffset) !== 0x3c) {
        throw new InputDataError('Could not find 0x3c at beginning of block.');
      }
      if (ba.getUint8(i + headerOffset + 1) !== 0x5a) {
        throw new InputDataError('Could not find 0x5a as second byte of block.');
      }
      blockType = ba.getUint8(i + headerOffset + 2);
      const blockLengthField = ba.getUint8(i + headerOffset + 3);
      Logger.debug(`Block type: 0x${blockType.toString(16)}, Block length field: 0x${blockLengthField.toString(16)}`);
      let blockToRecord: BufferAccess | undefined;
      switch (blockType) {
        case 0x00: // start block
          blockToRecord = ba.slice(i, headerOffset + 3 + blockLengthField);
          Logger.debug(blockToRecord.asHexDump());
          e.recordStartBlock(blockToRecord);
          break;
        case 0x01: // data block
        {
          const actualBlockLength = blockLengthField === 0x00 ? 0xff : blockLengthField;
          blockToRecord = ba.slice(i, headerOffset + 4 + actualBlockLength);
          Logger.debug(blockToRecord.asHexDump());
          e.recordDataBlock(blockToRecord);
          break;
        }
        case 0xff: // end block
          blockToRecord = ba.slice(i, headerOffset + 5);
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
