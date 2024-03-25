import {AtariEncoder} from './AtariEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from '../AdapterDefinition.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {hex8} from '../../../common/Utils.js';

const definition: AdapterDefinition = {
  name: 'Atari (Generic data)',
  internalName: 'atarigeneric',
  options: [],
  identify,
  encode,
};
export default definition;

const markerByte = 0x55;
const blockTypeFull = 0xfc;
const blockTypePartial = 0xfa;
const blockTypeEndOfFile = 0xfe;
const dataBytesPerBlock = 128;

const pilotIrgLength = 20000;
const defaultIrgLength = 3000;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = new AtariEncoder(recorder);
  e.setDefaultBaudrate();
  const chunks = ba.chunks(dataBytesPerBlock);
  for (let blockId = 0; blockId < chunks.length; blockId++) {
    recorder.beginAnnotation(`Block ${hex8(blockId)}`);
    const chunkBa = chunks[blockId];
    const partialBlock = chunkBa.length() !== dataBytesPerBlock;
    const blockType = partialBlock ? blockTypePartial : blockTypeFull;
    // actual block length will be 132 bytes: 2 markers, 1 block type byte, 128 actual data bytes, 1 checksum byte
    const blockBa = BufferAccess.create(132);
    blockBa.writeUint8(markerByte);
    blockBa.writeUint8(markerByte);
    blockBa.writeUint8(blockType);
    blockBa.writeBa(chunkBa); // (not always 128 bytes!)
    if (partialBlock) {
      blockBa.setUint8(130, chunkBa.length());
    }

    blockBa.setUint8(131, calculateChecksum(blockBa));
    e.recordIrg((blockId === 0) ? pilotIrgLength : defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
    e.recordBytes(blockBa);
    recorder.endAnnotation();
  }

  // End of file block
  recorder.beginAnnotation('Block EOF');
  const eofBlockBa = BufferAccess.create(132);
  eofBlockBa.writeUint8(markerByte);
  eofBlockBa.writeUint8(markerByte);
  eofBlockBa.writeUint8(blockTypeEndOfFile);
  eofBlockBa.setUint8(131, calculateChecksum(eofBlockBa));
  e.recordIrg(defaultIrgLength); // TODO: create option (longer values are required for "ENTER-loading")
  e.recordBytes(eofBlockBa);
  recorder.endAnnotation();
}

function calculateChecksum(ba: BufferAccess) {
  // 8 bit checksum with carry being added
  let sum = 0;
  for (const byte of ba.bytes()) {
    sum += byte;
    if (sum > 255) {
      sum = (sum & 0xff) + 1;
    }
  }

  return sum;
}
