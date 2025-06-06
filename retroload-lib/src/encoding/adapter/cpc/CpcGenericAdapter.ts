import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {InternalError, InvalidArgumentError} from '../../../common/Exceptions.js';
import {type OptionContainer, entryOption, loadOption, nameOption} from '../../Options.js';
import {calculateCrc16Ccitt, hex8} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TzxEncoder} from '../TzxEncoder.js';

/**
 * https://www.cpcwiki.eu/imgs/5/5d/S968se08.pdf
 */
export const CpcGenericAdapter: InternalAdapterDefinition = {
  label: 'CPC (Generic data)',
  name: 'cpcgeneric',
  options: [
    nameOption,
    loadOption,
    entryOption,
  ],
  identify,
  encode,
};

const fileTypeBinary = 2;
const dataBytesPerSegment = 256;
const segmentsPerDataBlock = 8;
const dataBytesPerDataBlock = dataBytesPerSegment * segmentsPerDataBlock;
const maxFileNameLength = 16;

const headerRecordSyncCharacter = 0x2c;
const dataRecordSyncCharacter = 0x16;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const filename = options.getArgument(nameOption);
  if (filename.length > maxFileNameLength) {
    throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
  }

  const load = options.getArgument(loadOption) ?? 0x0000;
  const entry = options.getArgument(entryOption) ?? 0x0000;

  const e = TzxEncoder.createForCpc(recorder);

  const chunks = ba.chunks(dataBytesPerDataBlock);

  e.begin();
  for (let b = 0; b < chunks.length; b++) {
    recorder.beginAnnotation(`Block ${hex8(b)}`);

    const chunk = chunks[b];
    const isFirstBlock = b === 0;
    const isLastBlock = b === (chunks.length - 1);
    const blockDataLocation = load + b * dataBytesPerDataBlock;

    // header block

    recorder.beginAnnotation('Header');

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
    e.recordDataBlock(headerRecordBa, {...e.standardSpeedRecordOptions, pauseLengthMs: 0x000a});

    recorder.endAnnotation(); // end of header

    // data block

    recorder.beginAnnotation('Data');

    const dataRecordBa = createDataRecord(chunk);
    e.recordDataBlock(dataRecordBa, {...e.standardSpeedRecordOptions, pauseLengthMs: 0x09c4});

    recorder.endAnnotation(); // end of data

    recorder.endAnnotation(); // end of block
  }
  e.end();
}

function createHeaderRecord(headerBa: BufferAccess): BufferAccess {
  if (headerBa.length() !== dataBytesPerSegment) {
    throw new InternalError(`Header record size must be exactly ${dataBytesPerSegment} bytes (padded with zeros).`);
  }
  const headerRecordSize = 1 + dataBytesPerSegment + 2 + 4; // sync char + data + checksum + trailer
  const headerRecordBa = BufferAccess.create(headerRecordSize);
  headerRecordBa.writeUint8(headerRecordSyncCharacter); // synchronisation character
  headerRecordBa.writeBa(headerBa); // data
  headerRecordBa.writeUint16Be(calculateCrc16Ccitt(headerBa)); // crc checksum
  headerRecordBa.writeUint32Le(0xffffffff); // trailer

  return headerRecordBa;
}

function createDataRecord(dataBa: BufferAccess): BufferAccess {
  if (dataBa.length() > dataBytesPerDataBlock) {
    throw new InternalError(`Data record size cannot exceed ${dataBytesPerDataBlock} bytes.`);
  }

  const segments = dataBa.chunksPadded(dataBytesPerSegment);
  const dataRecordSize = 1 + segments.length * (dataBytesPerSegment + 2) + 4;
  const dataRecordBa = BufferAccess.create(dataRecordSize);
  dataRecordBa.writeUint8(dataRecordSyncCharacter); // synchronisation character
  for (const segmentData of segments) {
    dataRecordBa.writeBa(segmentData); // data
    dataRecordBa.writeUint16Be(calculateCrc16Ccitt(segmentData)); // crc checksum
  }
  dataRecordBa.writeUint32Le(0xffffffff); // trailer

  return dataRecordBa;
}
