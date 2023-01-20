import {AbstractAdapter} from '../adapter.js';
import {Encoder} from '../../encoder/atari.js';
import {ExtDataView} from '../../utils.js';

const markerByte = 0x55;
const blockTypeFull = 0xfc;
const blockTypePartial = 0xfa;
const blockTypeEndOfFile = 0xfe;
const dataBytesPerBlock = 128;

const pilotIrgLength = 20000;
const defaultIrgLength = 3000;

export class AtariAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder);
    e.setDefaultBaudrate();
    const blocks = Math.ceil(dataView.byteLength / dataBytesPerBlock);
    console.debug(`Data block count: ${blocks}`);
    for (let blockId = 0; blockId < blocks; blockId++) {
      const remainingBytes = dataView.byteLength - (blockId * dataBytesPerBlock);
      const partialBlock = remainingBytes < dataBytesPerBlock;
      const dataBytesInCurrentBlock = partialBlock ? remainingBytes : dataBytesPerBlock;
      const blockType = partialBlock ? blockTypePartial : blockTypeFull;
      const dataDv = dataView.referencedSlice(blockId * dataBytesPerBlock, dataBytesInCurrentBlock);
      // actual block length will be 132 bytes: 2 markers, 1 block type byte, 128 actual data bytes, 1 checksum byte
      e.recordIrg((blockId === 0) ? pilotIrgLength : defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
      e.recordByte(markerByte);
      e.recordByte(markerByte);
      e.recordByte(blockType);
      e.recordBytes(dataDv);
      if (partialBlock) {
        for (let i = 0; i < dataBytesPerBlock - dataBytesInCurrentBlock - 1; i++) {
          e.recordByte(0);
        }
        e.recordByte(dataBytesInCurrentBlock);
      }
      e.recordByte(calculateChecksum(blockType, dataDv, partialBlock ? dataBytesInCurrentBlock : 0));
    }

    // End of file block
    e.recordIrg(defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
    e.recordByte(markerByte);
    e.recordByte(markerByte);
    e.recordByte(blockTypeEndOfFile);
    e.recordBytes(new ExtDataView(new ArrayBuffer(dataBytesPerBlock)));
    e.recordByte(0xa9); // precalculated checksum
  }
}

function calculateChecksum(blockType, dataDv, partialBlockByteCount) {
  // 8 bit checksum with carry being added
  let sum = ((0x55 + 0x55 + blockType) & 0xff) + 1; // + 1 because block type values will make it always overflow

  for (let i = 0; i < dataDv.byteLength; i++) {
    sum += dataDv.getUint8(i);
    if (sum > 255) {
      sum = (sum & 0xff) + 1;
    }
  }

  sum += partialBlockByteCount;
  if (sum > 255) {
    sum = (sum & 0xff) + 1;
  }

  return sum;
}
