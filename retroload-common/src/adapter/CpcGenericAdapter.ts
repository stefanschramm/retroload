import {CpcTzxEncoder} from '../encoder/CpcTzxEncoder.js';
import {EntryOption, LoadOption, NameOption, type OptionValues} from '../Options.js';
import {InternalError, InvalidArgumentError} from '../Exceptions.js';
import {BufferAccess} from '../BufferAccess.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileTypeBinary = 2;
const dataBytesPerSegment = 256;
const segmentsPerDataBlock = 8;
const dataBytesPerDataBlock = dataBytesPerSegment * segmentsPerDataBlock;
const maxFileNameLength = 16;

const headerRecordSyncCharacter = 0x2c;
const dataRecordSyncCharacter = 0x16;

export class CpcGenericAdapter extends AbstractGenericAdapter {
  static override getTargetName() {
    return CpcTzxEncoder.getTargetName();
  }

  static override getName() {
    return 'CPC (Generic data)';
  }

  static override getOptions() {
    return [
      NameOption,
      LoadOption,
      EntryOption,
    ];
  }

  /**
   * https://www.cpcwiki.eu/imgs/5/5d/S968se08.pdf
   */
  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const filename = (options.name ?? '') as string;
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const load = parseInt((options.load ?? '0000') as string, 16);
    if (isNaN(load) || load < 0 || load > 0xffff) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const entry = parseInt((options.entry ?? '0000') as string, 16);
    if (isNaN(entry) || entry < 0 || entry > 0xffff) {
      throw new InvalidArgumentError('entry', 'Option entry is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const e = new CpcTzxEncoder(recorder, options);

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
      headerBa.writeUInt8(b + 1); // block number
      headerBa.writeUInt8(isLastBlock ? 0xff : 0x00);
      headerBa.writeUInt8(fileTypeBinary);
      headerBa.writeUInt16LE(chunk.length());
      headerBa.writeUInt16LE(blockDataLocation);
      headerBa.writeUInt8(isFirstBlock ? 0xff : 0x00);
      // user fields
      headerBa.writeUInt16LE(ba.length()); // logical length
      headerBa.writeUInt16LE(entry); // entry address

      // Remaining bytes 28..63 stay unallocated. Rest of header segment is padded with zeros.

      const headerRecordBa = createHeaderRecord(headerBa);
      e.recordDataBlock(headerRecordBa, {...e.getStandardSpeedRecordOptions(), pauseLengthMs: 0x000a});

      // data block

      const dataRecordBa = createDataRecord(chunk);
      e.recordDataBlock(dataRecordBa, {...e.getStandardSpeedRecordOptions(), pauseLengthMs: 0x09c4});
    }
    e.end();
  }
}

function createHeaderRecord(headerBa: BufferAccess) {
  if (headerBa.length() !== dataBytesPerSegment) {
    throw new InternalError(`Header record size must be exactly ${dataBytesPerSegment} bytes (padded with zeros).`);
  }
  const headerRecordSize = 1 + dataBytesPerSegment + 2 + 4; // sync char + data + checksum + trailer
  const headerRecordBa = BufferAccess.create(headerRecordSize);
  headerRecordBa.writeUInt8(headerRecordSyncCharacter); // synchronisation character
  headerRecordBa.writeBa(headerBa); // data
  headerRecordBa.writeUInt16BE(calculateSegmentCrc(headerBa)); // crc checksum
  headerRecordBa.writeUInt32LE(0xffffffff); // trailer

  return headerRecordBa;
}

function createDataRecord(dataBa: BufferAccess) {
  if (dataBa.length() > dataBytesPerDataBlock) {
    throw new InternalError(`Data record size cannot exceed ${dataBytesPerDataBlock} bytes.`);
  }

  const segments = dataBa.chunksPadded(dataBytesPerSegment, 0x00);
  const dataRecordSize = 1 + segments.length * (dataBytesPerSegment + 2) + 4;
  const dataRecordBa = BufferAccess.create(dataRecordSize);
  dataRecordBa.writeUInt8(dataRecordSyncCharacter); // synchronisation character
  for (const segmentData of segments) {
    dataRecordBa.writeBa(segmentData); // data
    dataRecordBa.writeUInt16BE(calculateSegmentCrc(segmentData)); // crc checksum
  }
  dataRecordBa.writeUInt32LE(0xffffffff); // trailer

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
