import {AbstractAdapter} from '../adapter.js';
import {Encoder} from '../../encoder/cpctzx.js';
import {EntryOption, LoadOption, NameOption} from '../../option.js';
import {ExtDataView} from '../../utils.js';
import {InternalError, InvalidArgumentError} from '../../exception.js';

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

export class CpcAdapter extends AbstractAdapter {
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
   * @param {ExtDataView} dataView
   * @param {*} options
   */
  static encode(recorder, dataView, options) {
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

    const dataRecordCount = Math.ceil(dataView.byteLength / dataBytesPerDataBlock);
    const dataBytesInLastBlock = dataView.byteLength - (dataRecordCount - 1) * dataBytesPerDataBlock;

    e.begin();
    for (let b = 0; b < dataRecordCount; b++) {
      const isFirstBlock = b === 0;
      const isLastBlock = b === (dataRecordCount - 1);
      const blockDataLocation = load + b * dataBytesPerDataBlock;
      const dataBytesInCurrentBlock = isLastBlock ? dataBytesInLastBlock : dataBytesPerDataBlock;

      // header block

      const headerBuffer = new ArrayBuffer(0x100);
      const headerDv = new ExtDataView(headerBuffer);
      headerDv.setString(0, filename, maxFileNameLength, 0);
      headerDv.setUint8(16, b + 1); // block number
      headerDv.setUint8(17, isLastBlock ? 0xff : 0x00);
      headerDv.setUint8(18, fileTypeBinary);
      headerDv.setUint16(19, dataBytesInCurrentBlock, true);
      headerDv.setUint16(21, blockDataLocation, true);
      headerDv.setUint8(23, isFirstBlock ? 0xff : 0x00);
      // user fields
      headerDv.setUint16(24, dataView.byteLength, true); // logical length
      headerDv.setUint16(26, entry, true); // entry address

      // Remaining bytes 28..63 stay unallocated. Rest of header segment is padded with zeros.

      const headerRecordDv = createHeaderRecord(headerDv);
      e.recordDataBlock(headerRecordDv, {...standardRecordOptions, pauseLengthMs: 0x000a});

      // data block

      const dataRecordDv = createDataRecord(dataView.referencedSlice(b * dataBytesPerDataBlock, dataBytesInCurrentBlock));
      e.recordDataBlock(dataRecordDv, {...standardRecordOptions, pauseLengthMs: 0x09c4});
    }
    e.end();
  }
}

/**
 * @param {ExtDataView} headerDv
 * @return {ExtDataView}
 */
function createHeaderRecord(headerDv) {
  if (headerDv.byteLength !== dataBytesPerSegment) {
    throw new InternalError(`Header record size must be exactly ${dataBytesPerSegment} bytes (padded with zeros).`);
  }
  const headerRecordSize = 1 + dataBytesPerSegment + 2 + 4; // sync char + data + checksum + trailer
  const headerRecordDv = new ExtDataView(new ArrayBuffer(headerRecordSize));
  headerRecordDv.setUint8(0, headerRecordSyncCharacter); // synchronisation character
  headerRecordDv.setUint8Array(1, headerDv.asUint8ArrayCopy()); // data
  headerRecordDv.setUint16(1 + dataBytesPerSegment, calculateSegmentCrc(headerDv), false); // crc checksum
  headerRecordDv.setUint32(1 + dataBytesPerSegment + 2, 0xffffffff); // trailer

  return headerRecordDv;
}

/**
 * @param {ExtDataView} dataDv
 * @return {ExtDataView}
 */
function createDataRecord(dataDv) {
  if (dataDv.byteLength > dataBytesPerDataBlock) {
    throw new InternalError(`Data record size cannot exceed ${dataBytesPerDataBlock} bytes.`);
  }

  const segmentCount = Math.ceil(dataDv.byteLength / dataBytesPerSegment);
  const dataRecordSize = 1 + segmentCount * (dataBytesPerSegment + 2) + 4;
  const dataRecordDv = new ExtDataView(new ArrayBuffer(dataRecordSize));

  dataRecordDv.setUint8(0, dataRecordSyncCharacter); // synchronisation character
  for (let s = 0; s < segmentCount; s++) {
    const paddingRequired = (s * dataBytesPerSegment + dataBytesPerSegment) > dataDv.byteLength;
    const segmentDataOffset = 1 + s * (dataBytesPerSegment + 2);
    if (paddingRequired) {
      const remainingDataDv = dataDv.referencedSlice(s * dataBytesPerSegment, dataDv.byteLength - s * dataBytesPerSegment);
      const paddedRemainingDataDv = remainingDataDv.asPaddedCopy(dataBytesPerSegment);
      dataRecordDv.setUint8Array(segmentDataOffset, paddedRemainingDataDv.asUint8ArrayCopy()); // data
      dataRecordDv.setUint16(segmentDataOffset + dataBytesPerSegment, calculateSegmentCrc(paddedRemainingDataDv), false); // crc checksum
    } else {
      dataRecordDv.setUint8Array(segmentDataOffset, dataDv.referencedSlice(s * dataBytesPerSegment, dataBytesPerSegment).asUint8ArrayCopy()); // data
    }
  }
  dataRecordDv.setUint32(dataRecordDv.byteLength - 4, 0xffffffff); // trailer

  return dataRecordDv;
}

/**
 * https://gist.github.com/chitchcock/5112270?permalink_comment_id=3834064#gistcomment-3834064
 *
 * @param {DataView} dv
 * @return {number}
 */
function calculateSegmentCrc(dv) {
  const polynomial = 0x1021;
  let crc = 0xffff;
  for (let n = 0; n < dv.byteLength; n++) {
    const b = dv.getUint8(n);
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
