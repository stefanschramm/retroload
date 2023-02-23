import {Encoder} from '../encoder/atari.js';
import {BufferAccess} from '../buffer_access.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

const markerByte = 0x55;
const blockTypeFull = 0xfc;
const blockTypePartial = 0xfa;
const blockTypeEndOfFile = 0xfe;
const dataBytesPerBlock = 128;

const pilotIrgLength = 20000;
const defaultIrgLength = 3000;

export class AtariGenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  /**
   * @param {WaveRecorder|PcmRecorder} recorder
   * @param {BufferAccess} ba
   * @param {object} options
   */
  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    e.setDefaultBaudrate();
    const blocks = Math.ceil(ba.length() / dataBytesPerBlock);
    for (let blockId = 0; blockId < blocks; blockId++) {
      const remainingBytes = ba.length() - (blockId * dataBytesPerBlock);
      const partialBlock = remainingBytes < dataBytesPerBlock;
      const dataBytesInCurrentBlock = partialBlock ? remainingBytes : dataBytesPerBlock;
      const blockType = partialBlock ? blockTypePartial : blockTypeFull;
      const dataBa = ba.slice(blockId * dataBytesPerBlock, dataBytesInCurrentBlock);
      // actual block length will be 132 bytes: 2 markers, 1 block type byte, 128 actual data bytes, 1 checksum byte
      const blockBa = BufferAccess.create(132);
      blockBa.writeUInt8(markerByte);
      blockBa.writeUInt8(markerByte);
      blockBa.writeUInt8(blockType);
      blockBa.writeBa(dataBa); // (not always 128 bytes!)
      if (partialBlock) {
        blockBa.setUint8(130, dataBytesInCurrentBlock);
      }
      blockBa.setUint8(131, calculateChecksum(blockBa));
      e.recordIrg((blockId === 0) ? pilotIrgLength : defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
      e.recordBytes(blockBa);
    }

    // End of file block
    const eofBlockBa = BufferAccess.create(132);
    eofBlockBa.writeUInt8(markerByte);
    eofBlockBa.writeUInt8(markerByte);
    eofBlockBa.writeUInt8(blockTypeEndOfFile);
    eofBlockBa.setUint8(131, calculateChecksum(eofBlockBa));
    e.recordIrg(defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
    e.recordBytes(eofBlockBa);
  }
}

function calculateChecksum(ba) {
  // 8 bit checksum with carry being added
  let sum = 0;
  for (let i = 0; i < ba.length(); i++) {
    sum += ba.getUint8(i);
    if (sum > 255) {
      sum = (sum & 0xff) + 1;
    }
  }

  return sum;
}
