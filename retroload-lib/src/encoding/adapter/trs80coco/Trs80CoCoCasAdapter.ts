import {BLOCK_TYPE_END_OF_FILE, BLOCK_TYPE_NAMEFILE, Trs80CoCoEncoder} from './Trs80CoCoEncoder.js';
import {FormatIdentification, InternalAdapterDefinition} from '../AdapterDefinition.js';
import {calculateChecksum8, hex8} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {OptionContainer} from '../../Options.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

export const Trs80CoCoCasAdapter: InternalAdapterDefinition = {
  label: 'TRS-80 Color Computer .CAS file',
  name: 'trs80cococas',
  options: [],
  identify,
  encode,
};

const blockHeader = [0x55, 0x55, 0x55, 0x55]; // (at least)

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.cas$/iu).exec(filename) !== null,
    header: ba.containsDataAt(0, blockHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new Trs80CoCoEncoder(recorder);
  e.begin();

  if (ba.getUint8(0) !== 0x55) {
    throw new InputDataError('Missing block sync sequence in input data.');
  }

  // We need to process the blocks only to be able to put the silence at the right places.
  let syncOffset = 0;
  while (syncOffset < ba.length()) {
    let i = syncOffset;
    while (ba.getUint8(i) === 0x55) {
      i++;
    }
    const beginOfBlock = i;
    if (ba.getUint8(i) !== 0x3c) {
      throw new InputDataError(`Missing sync byte at beginning of block. Expected 0x3c, got ${hex8(ba.getUint8(i))} at offset ${i}.`);
    }
    const type = ba.getUint8(beginOfBlock + 1);
    const length = ba.getUint8(beginOfBlock + 2);
    const checkedData = ba.slice(beginOfBlock + 1, length + 2);
    const checksum = ba.getUint8(beginOfBlock + 3 + length);
    Logger.debug(`Block type: ${hex8(type)}, Length: ${hex8(length)}, Checksum: ${hex8(checksum)}`);
    const calculatedChecksum = calculateChecksum8(checkedData);
    if (checksum !== calculatedChecksum) {
      Logger.error(`Stored Checksum ${hex8(checksum)} of block does not match calculated checksum: ${hex8(calculatedChecksum)}`);
    }
    const rawBlockLength = beginOfBlock - syncOffset + length + 5;
    // The last block always seems to be truncated? (no trailing 0x55)
    const fixedRawBlockLength =
      (syncOffset + rawBlockLength) > ba.length()
        ? ba.length() - syncOffset
        : rawBlockLength;
    const rawBlock = ba.slice(syncOffset, fixedRawBlockLength);
    Logger.debug(rawBlock.asHexDump());

    e.recordRawBytes(rawBlock);
    if (type === BLOCK_TYPE_NAMEFILE || type === BLOCK_TYPE_END_OF_FILE) {
      e.recordPause();
      Logger.debug('PAUSE');
    }

    syncOffset += rawBlockLength;
  }


  e.end();
}
