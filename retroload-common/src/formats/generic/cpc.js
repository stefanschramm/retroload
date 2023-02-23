import {AbstractAdapter} from '../adapter.js';
import {Encoder} from '../../encoder/cpctzx.js';
import {EntryOption, LoadOption, NameOption} from '../../option.js';
import {InternalError, InvalidArgumentError} from '../../exception.js';
import {BufferAccess} from '../../buffer_access.js';

const fileTypeBinary = 2;
const dataBytesPerSegment = 256;
const segmentsPerDataBlock = 8;
const dataBytesPerDataBlock = dataBytesPerSegment * segmentsPerDataBlock;
const maxFileNameLength = 16;

const headerRecordSyncCharacter = 0x2c;
const dataRecordSyncCharacter = 0x16;

const standardRecordOptions = {
  pilotPulseLength: 0x091a,
  syncFirstPulseLength: 0x048d,
  syncSecondPulseLength: 0x048d,
  zeroBitPulseLength: 0x048d,
  oneBitPulseLength: 0x091a,
  pilotPulses: 0x1000,
  lastByteUsedBits: 8,
  pauseLengthMs: 0x000a,
};

export class CpcGenericAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return [
      NameOption,
      LoadOption,
      EntryOption,
    ];
  }

  /**
   * https://www.cpcwiki.eu/imgs/5/5d/S968se08.pdf
   *
   * @param {WaveRecorder|PcmRecorder} recorder
   * @param {BufferAccess} ba
   * @param {*} options
   */
  static encode(recorder, ba, options) {
    const filename = options.name !== undefined ? options.name : '';
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const load = parseInt(options.load !== undefined ? options.load : '0000', 16);
    if (isNaN(load) || load < 0 || load > 0xffff) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const entry = parseInt(options.entry !== undefined ? options.entry : '0000', 16);
    if (isNaN(entry) || entry < 0 || entry > 0xffff) {
      throw new InvalidArgumentError('entry', 'Option entry is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const e = new Encoder(recorder);

    const dataRecordCount = Math.ceil(ba.length() / dataBytesPerDataBlock);
    const dataBytesInLastBlock = ba.length() - (dataRecordCount - 1) * dataBytesPerDataBlock;

    e.begin();
    for (let b = 0; b < dataRecordCount; b++) {
      const isFirstBlock = b === 0;
      const isLastBlock = b === (dataRecordCount - 1);
      const blockDataLocation = load + b * dataBytesPerDataBlock;
      const dataBytesInCurrentBlock = isLastBlock ? dataBytesInLastBlock : dataBytesPerDataBlock;

      // header block

      const headerBa = BufferAccess.create(0x100);
      headerBa.setAsciiString(0, filename, maxFileNameLength, 0);
      headerBa.setUint8(16, b + 1); // block number
      headerBa.setUint8(17, isLastBlock ? 0xff : 0x00);
      headerBa.setUint8(18, fileTypeBinary);
      headerBa.setUint16LE(19, dataBytesInCurrentBlock);
      headerBa.setUint16LE(21, blockDataLocation);
      headerBa.setUint8(23, isFirstBlock ? 0xff : 0x00);
      // user fields
      headerBa.setUint16LE(24, ba.length()); // logical length
      headerBa.setUint16LE(26, entry); // entry address

      // Remaining bytes 28..63 stay unallocated. Rest of header segment is padded with zeros.

      const headerRecordBa = createHeaderRecord(headerBa);
      e.recordDataBlock(headerRecordBa, {...standardRecordOptions, pauseLengthMs: 0x000a});

      // data block

      const dataRecordBa = createDataRecord(ba.slice(b * dataBytesPerDataBlock, dataBytesInCurrentBlock));
      e.recordDataBlock(dataRecordBa, {...standardRecordOptions, pauseLengthMs: 0x09c4});
    }
    e.end();
  }
}

/**
 * @param {BufferAccess} headerBa
 * @return {BufferAccess}
 */
function createHeaderRecord(headerBa) {
  if (headerBa.length() !== dataBytesPerSegment) {
    throw new InternalError(`Header record size must be exactly ${dataBytesPerSegment} bytes (padded with zeros).`);
  }
  const headerRecordSize = 1 + dataBytesPerSegment + 2 + 4; // sync char + data + checksum + trailer
  const headerRecordBa = BufferAccess.create(headerRecordSize);
  headerRecordBa.setUint8(0, headerRecordSyncCharacter); // synchronisation character
  headerRecordBa.setBa(1, headerBa); // data
  headerRecordBa.setUint16BE(1 + dataBytesPerSegment, calculateSegmentCrc(headerBa)); // crc checksum
  headerRecordBa.setUint32LE(1 + dataBytesPerSegment + 2, 0xffffffff); // trailer

  return headerRecordBa;
}

/**
 * @param {BufferAccess} dataBa
 * @return {BufferAccess}
 */
function createDataRecord(dataBa) {
  if (dataBa.length() > dataBytesPerDataBlock) {
    throw new InternalError(`Data record size cannot exceed ${dataBytesPerDataBlock} bytes.`);
  }

  const segmentCount = Math.ceil(dataBa.length() / dataBytesPerSegment);
  const dataRecordSize = 1 + segmentCount * (dataBytesPerSegment + 2) + 4;
  const dataRecordBa = BufferAccess.create(dataRecordSize);

  dataRecordBa.setUint8(0, dataRecordSyncCharacter); // synchronisation character
  for (let s = 0; s < segmentCount; s++) {
    const paddingRequired = (s * dataBytesPerSegment + dataBytesPerSegment) > dataBa.length();
    const segmentDataOffset = 1 + s * (dataBytesPerSegment + 2);
    if (paddingRequired) {
      const remainingDataBa = dataBa.slice(s * dataBytesPerSegment, dataBa.length() - s * dataBytesPerSegment);
      const paddedRemainingDataBa = BufferAccess.create(dataBytesPerSegment);
      paddedRemainingDataBa.setBa(0, remainingDataBa);
      dataRecordBa.setBa(segmentDataOffset, paddedRemainingDataBa); // data
      dataRecordBa.setUint16BE(segmentDataOffset + dataBytesPerSegment, calculateSegmentCrc(paddedRemainingDataBa)); // crc checksum
    } else {
      dataRecordBa.setBa(segmentDataOffset, dataBa.slice(s * dataBytesPerSegment, dataBytesPerSegment)); // data
    }
  }
  dataRecordBa.setUint32LE(dataRecordBa.length() - 4, 0xffffffff); // trailer

  return dataRecordBa;
}

/**
 * https://gist.github.com/chitchcock/5112270?permalink_comment_id=3834064#gistcomment-3834064
 *
 * @param {BufferAccess} ba
 * @return {number}
 */
function calculateSegmentCrc(ba) {
  const polynomial = 0x1021;
  let crc = 0xffff;
  for (let n = 0; n < ba.length(); n++) {
    const b = ba.getUint8(n);
    for (let i = 0; i < 8; i++) {
      const bit = (b >> (7 - i) & 1) === 1;
      const c15 = (crc >> 15 & 1) === 1;
      crc <<= 1;
      if (c15 ^ bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xffff;

  return crc ^ 0xffff; // The negation is not part of the actual CRC16-CCITT code.
}
