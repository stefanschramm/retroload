import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Mo5Encoder} from './Mo5Encoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type OptionContainer} from '../../Options.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {hex8} from '../../../common/Utils.js';

/**
 * Adapter for MO5 .K7 files
 */
const definition: AdapterDefinition = {
  name: 'MO5 .K7-File',
  internalName: 'k7',
  options: [],
  identify,
  encode,
};
export default definition;

// The number of 0x01 in the header seems to vary.
// By definition it should be 16, but many images have more and some less.
const fileHeader = [0x01, 0x01, 0x01, 0x01];

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.k7/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = new Mo5Encoder(recorder);
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
    Logger.debug(`Block type: ${hex8(blockType)}, Block length field: ${hex8(blockLengthField)}`);
    let blockToRecord: BufferAccess | undefined;
    switch (blockType) {
      case 0x00: // start block
        blockToRecord = ba.slice(i, headerOffset + 3 + blockLengthField);
        e.recordStartBlock(blockToRecord);
        break;
      case 0x01: // data block
      {
        const actualBlockLength = blockLengthField === 0x00 ? 0xff : (blockLengthField - 1);
        blockToRecord = ba.slice(i, headerOffset + 4 + actualBlockLength);
        e.recordDataBlock(blockToRecord);
        break;
      }
      case 0xff: // end block
        blockToRecord = ba.slice(i, headerOffset + 5);
        e.recordEndBlock(blockToRecord);
        break;
      default:
        throw new InputDataError(`Unknown blocktype: ${hex8(blockType)}`);
    }
    if (blockToRecord.length() === 0) {
      throw new InputDataError('Read invalid block size.'); // prevents infinite looping
    }
    i += blockToRecord.length();
  }
  e.end();
}
