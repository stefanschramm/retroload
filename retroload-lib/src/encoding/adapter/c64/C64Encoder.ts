import {AbstractEncoder} from '../AbstractEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface, SampleValue} from '../../recorder/RecorderInterface.js';
import {C64MachineType} from './C64Options.js';

const clockCycleMap: Record<C64MachineType, number> = {
  c64pal: 985248,
  c64ntsc: 1022727,
  vic20pal: 1108405,
  vic20ntsc: 1022727,
};

const fileTypeBasic = 0x01;
const fileTypeSeqFileDataBlock = 0x02;
const fileTypePrg = 0x03;
const fileTypeSeqFileHeader = 0x04;
// const fileTypeEndOfTapeMarker = 0x05;

const pulseShort = 8 * 0x2f;
const pulseMedium = 8 * 0x42;
const pulseLong = 8 * 0x56;

/**
 * Encoder for C64 and VIC-20
 *
 * https://www.c64-wiki.com/wiki/Datassette_Encoding
 * 64 intern (Angerhausen, Brückmann, Englisch, Gerits), 4th edition, p. 120 - 122
 */
export class C64Encoder extends AbstractEncoder {
  private readonly clockCycles;

  constructor(
    recorder: RecorderInterface,
    private readonly shortpilot = false,
    machineType = C64MachineType.c64pal,
  ) {
    super(recorder);
    this.clockCycles = clockCycleMap[machineType];
  }

  public recordPulse(pulseLength: number) {
    // Note: The .tap file adapter uses recordPulse directly.
    const samples = Math.ceil((0.5 * this.recorder.sampleRate * pulseLength) / this.clockCycles);
    for (const value of [SampleValue.High, SampleValue.Low]) {
      for (let j = 0; j < samples; j += 1) {
        this.recorder.pushSample(value);
      }
    }
  }

  public recordBasic(startAddress: number, filename: string, dataBa: BufferAccess) {
    // TODO: test
    this.recordBasicOrPrg(fileTypeBasic, startAddress, filename, dataBa);
  }

  public recordPrg(startAddress: number, filename: string, dataBa: BufferAccess) {
    this.recordBasicOrPrg(fileTypePrg, startAddress, filename, dataBa);
  }

  public recordData(filenameBuffer: string, dataBa: BufferAccess) {
    const headerBa = BufferAccess.create(192);
    headerBa.writeUint8(fileTypeSeqFileHeader); // 1 byte: file type: seq
    headerBa.writeUint16Le(0xa000); // 2 bytes: start address (unused)
    headerBa.writeUint16Le(0x0000); // 2 bytes: end address (unused)
    headerBa.writeAsciiString(filenameBuffer); // 16 bytes: filename
    headerBa.writeAsciiString(' '.repeat(171)); // 171 bytes: padding with spaces

    Logger.debug('C64Encoder - recordData - header:');
    Logger.debug(headerBa.asHexDump());

    // header
    this.recordPilot(this.shortpilot ? 0x1a00 : 0x6a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();
    // header repeated
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();

    const dataWithZeroByte = BufferAccess.create(dataBa.length() + 1);
    dataWithZeroByte.writeBa(dataBa);
    dataWithZeroByte.writeUint8(0x00);

    const chunks = dataWithZeroByte.chunksPadded(191, 0x20);
    for (const chunk of chunks) {
      const blockBa = BufferAccess.create(192);
      blockBa.writeUint8(fileTypeSeqFileDataBlock);
      blockBa.writeBa(chunk);

      Logger.debug('C64Encoder - recordData - data:');
      Logger.debug(blockBa.asHexDump());

      // data
      this.recordPilot(0x1a00);
      this.recordSyncChain();
      this.recordDataWithCheckByte(blockBa); // include end of data marker
      this.recordEndOfDataMarker();
      // data repeated
      this.recordPilot(0x4f);
      this.recordSyncChainRepeated();
      this.recordDataWithCheckByte(blockBa); // include end of data marker
      this.recordEndOfDataMarker();
      this.recordPilot(0x4e);
    }
  }

  override recordBit(value: number) {
    if (value) {
      this.recordPulse(pulseMedium);
      this.recordPulse(pulseShort);
    } else {
      this.recordPulse(pulseShort);
      this.recordPulse(pulseMedium);
    }
  }

  override recordByte(byte: number) {
    this.recordNewDataMarker();
    let checkBit = 1;
    for (let i = 0; i < 8; i += 1) {
      const bit = ((byte & (1 << i)) === 0) ? 0 : 1;
      checkBit ^= bit;
      this.recordBit(bit);
    }
    this.recordBit(checkBit);
  }

  private recordNewDataMarker() {
    this.recordPulse(pulseLong);
    this.recordPulse(pulseMedium);
  }

  private recordEndOfDataMarker() {
    this.recordPulse(pulseLong);
    this.recordPulse(pulseShort);
  }

  private recordPilot(pulses: number) {
    for (let i = 0; i < pulses; i++) {
      this.recordPulse(pulseShort);
    }
  }

  private recordSyncChain() {
    const syncChain = new Uint8Array([0x89, 0x88, 0x87, 0x86, 0x85, 0x84, 0x83, 0x82, 0x81]);
    this.recordBytes(BufferAccess.createFromUint8Array(syncChain));
  }

  private recordSyncChainRepeated() {
    const syncChain = new Uint8Array([0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
    this.recordBytes(BufferAccess.createFromUint8Array(syncChain));
  }

  private recordDataWithCheckByte(dataBa: BufferAccess) {
    let checkByte = 0;
    for (const byte of dataBa.bytes()) {
      checkByte ^= byte;
      this.recordByte(byte);
    }
    this.recordByte(checkByte);
  }

  private recordBasicOrPrg(fileType: number, startAddress: number, filename: string, dataBa: BufferAccess) {
    const headerBa = BufferAccess.create(192);
    headerBa.writeUint8(fileType); // 1 byte: file type: prg or basic file
    headerBa.writeUint16Le(startAddress); // 2 bytes: start address
    headerBa.writeUint16Le(startAddress + dataBa.length()); // 2 bytes: end address
    headerBa.writeAsciiString(filename); // 16 bytes: filename
    headerBa.writeAsciiString(' '.repeat(171)); // 171 bytes: padding with spaces

    this.recorder.beginAnnotation('File');

    Logger.debug('C64Encoder - recordBasicOrPrg - header:');
    Logger.debug(headerBa.asHexDump());

    this.recorder.beginAnnotation('Header');
    this.recordPilot(this.shortpilot ? 0x1a00 : 0x6a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();
    this.recorder.endAnnotation();

    this.recorder.beginAnnotation('Header repeated');
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();
    this.recorder.endAnnotation();

    Logger.debug('C64Encoder - recordBasicOrPrg - data:');
    Logger.debug(dataBa.asHexDump());

    this.recorder.beginAnnotation('Data');
    this.recordPilot(0x1a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(dataBa); // include end of data marker
    this.recordEndOfDataMarker();
    this.recorder.endAnnotation();

    this.recorder.beginAnnotation('Data repeated');
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(dataBa); // include end of data marker
    this.recordEndOfDataMarker();
    this.recordPilot(0x4e);
    this.recorder.endAnnotation();

    this.recorder.endAnnotation();
  }
}
