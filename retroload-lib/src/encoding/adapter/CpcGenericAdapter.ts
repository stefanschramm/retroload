import {CpcTzxEncoder} from '../encoder/CpcTzxEncoder.js';
import {entryOption, loadOption, nameOption, type OptionContainer} from '../Options.js';
import {InternalError, InvalidArgumentError} from '../../common/Exceptions.js';
import {BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const fileTypeBinary = 2;
const dataBytesPerSegment = 256;
const segmentsPerDataBlock = 8;
const dataBytesPerDataBlock = dataBytesPerSegment * segmentsPerDataBlock;
const maxFileNameLength = 16;

const headerRecordSyncCharacter = 0x2c;
const dataRecordSyncCharacter = 0x16;

const definition: AdapterDefinition = {

  name: 'CPC (Generic data)',

  internalName: 'cpcgeneric',

  targetName: CpcTzxEncoder.getTargetName(),

  options: [
    nameOption,
    loadOption,
    entryOption,
  ],

  identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  },

  /**
   * https://www.cpcwiki.eu/imgs/5/5d/S968se08.pdf
   */
  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const filename = options.getArgument(nameOption);
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const load = options.getArgument(loadOption) ?? 0x0000;
    const entry = options.getArgument(entryOption) ?? 0x0000;

    const e = new CpcTzxEncoder(recorder);

    const chunks = ba.chunks(dataBytesPerDataBlock);

    e.begin();
    for (let b = 0; b < chunks.length; b++) {
      const chunk = chunks[b];
      const isFirstBlock = b === 0;
      const isLastBlock = b === (chunks.length - 1);
      const blockDataLocation = load + b * dataBytesPerDataBlock;

      // header block

      const headerBa = BufferAccess.create(0x100);
      headerBa.writeAsciiString(filename, maxFileNameLength, 0);
      headerBa.writeUint8(b + 1); // block number
      headerBa.writeUint8(isLastBlock ? 0xff : 0x00);
      headerBa.writeUint8(fileTypeBinary);
      headerBa.writeUint16Le(chunk.length());
      headerBa.writeUint16Le(blockDataLocation);
      headerBa.writeUint8(isFirstBlock ? 0xff : 0x00);
      // user fields
      headerBa.writeUint16Le(ba.length()); // logical length
      headerBa.writeUint16Le(entry); // entry address

      // Remaining bytes 28..63 stay unallocated. Rest of header segment is padded with zeros.

      const headerRecordBa = createHeaderRecord(headerBa);
      e.recordDataBlock(headerRecordBa, {...e.getStandardSpeedRecordOptions(), pauseLengthMs: 0x000a});

      // data block

      const dataRecordBa = createDataRecord(chunk);
      e.recordDataBlock(dataRecordBa, {...e.getStandardSpeedRecordOptions(), pauseLengthMs: 0x09c4});
    }
    e.end();
  },
};
export default definition;

function createHeaderRecord(headerBa: BufferAccess) {
  if (headerBa.length() !== dataBytesPerSegment) {
    throw new InternalError(`Header record size must be exactly ${dataBytesPerSegment} bytes (padded with zeros).`);
  }
  const headerRecordSize = 1 + dataBytesPerSegment + 2 + 4; // sync char + data + checksum + trailer
  const headerRecordBa = BufferAccess.create(headerRecordSize);
  headerRecordBa.writeUint8(headerRecordSyncCharacter); // synchronisation character
  headerRecordBa.writeBa(headerBa); // data
  headerRecordBa.writeUint16Be(calculateSegmentCrc(headerBa)); // crc checksum
  headerRecordBa.writeUint32Le(0xffffffff); // trailer

  return headerRecordBa;
}

function createDataRecord(dataBa: BufferAccess) {
  if (dataBa.length() > dataBytesPerDataBlock) {
    throw new InternalError(`Data record size cannot exceed ${dataBytesPerDataBlock} bytes.`);
  }

  const segments = dataBa.chunksPadded(dataBytesPerSegment);
  const dataRecordSize = 1 + segments.length * (dataBytesPerSegment + 2) + 4;
  const dataRecordBa = BufferAccess.create(dataRecordSize);
  dataRecordBa.writeUint8(dataRecordSyncCharacter); // synchronisation character
  for (const segmentData of segments) {
    dataRecordBa.writeBa(segmentData); // data
    dataRecordBa.writeUint16Be(calculateSegmentCrc(segmentData)); // crc checksum
  }
  dataRecordBa.writeUint32Le(0xffffffff); // trailer

  return dataRecordBa;
}

/**
 * https://gist.github.com/chitchcock/5112270?permalink_comment_id=3834064#gistcomment-3834064
 */
function calculateSegmentCrc(ba: BufferAccess): number {
  const polynomial = 0x1021;
  let crc = 0xffff;
  for (let n = 0; n < ba.length(); n++) {
    const b = ba.getUint8(n);
    for (let i = 0; i < 8; i++) {
      const bit = (b >> (7 - i) & 1) === 1;
      const c15 = (crc >> 15 & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xffff;

  return crc ^ 0xffff; // The negation is not part of the actual CRC16-CCITT code.
}
