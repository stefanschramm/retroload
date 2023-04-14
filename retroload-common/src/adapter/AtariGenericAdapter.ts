import {AtariEncoder} from '../encoder/AtariEncoder.js';
import {BufferAccess} from '../BufferAccess.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type OptionValues} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const markerByte = 0x55;
const blockTypeFull = 0xfc;
const blockTypePartial = 0xfa;
const blockTypeEndOfFile = 0xfe;
const dataBytesPerBlock = 128;

const pilotIrgLength = 20000;
const defaultIrgLength = 3000;

export class AtariGenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return AtariEncoder.getTargetName();
  }

  static override getName() {
    return 'Atari (Generic data)';
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new AtariEncoder(recorder, options);
    e.setDefaultBaudrate();
    const chunks = ba.chunks(dataBytesPerBlock);
    for (let blockId = 0; blockId < chunks.length; blockId++) {
      const chunkBa = chunks[blockId];
      const partialBlock = chunkBa.length() !== dataBytesPerBlock;
      const blockType = partialBlock ? blockTypePartial : blockTypeFull;
      // actual block length will be 132 bytes: 2 markers, 1 block type byte, 128 actual data bytes, 1 checksum byte
      const blockBa = BufferAccess.create(132);
      blockBa.writeUInt8(markerByte);
      blockBa.writeUInt8(markerByte);
      blockBa.writeUInt8(blockType);
      blockBa.writeBa(chunkBa); // (not always 128 bytes!)
      if (partialBlock) {
        blockBa.setUint8(130, chunkBa.length());
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

function calculateChecksum(ba: BufferAccess) {
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
