import {AbstractEncoder} from './AbstractEncoder.js';
import {InternalError} from '../Exceptions.js';
import {BufferAccess} from '../BufferAccess.js';
import {Logger} from '../Logger.js';
import {SampleValue} from '../recorder/RecorderInterface.js';

const palClockCycles = 985248;

const fileTypeBasic = 0x01;
// const fileTypeSeqFileDataBlock = 0x02;
const fileTypePrg = 0x03;
// const fileTypeSeqFileHeader = 0x04;
// const fileTypeEndOfTapeMarker = 0x05;

/**
 * Encoder for C64 and VIC-20
 *
 * https://www.c64-wiki.com/wiki/Datassette_Encoding
 * 64 intern (Angerhausen, Brückmann, Englisch, Gerits), 4th edition, p. 120 - 122
 */
export class C64Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'c64';
  }

  recordPulse(pulseLength: number) {
    // Note: The .tap file adapter uses recordPulse directly.
    const samples = Math.ceil((0.5 * this.recorder.sampleRate * pulseLength) / palClockCycles);
    for (const value of [SampleValue.High, SampleValue.Low]) {
      for (let j = 0; j < samples; j += 1) {
        this.recorder.pushSample(value);
      }
    }
  }

  recordShortPulse() {
    this.recordPulse(8 * 0x2f);
  }

  recordMediumPulse() {
    this.recordPulse(8 * 0x42);
  }

  recordLongPulse() {
    this.recordPulse(8 * 0x56);
  }

  recordBit(value: number) {
    if (value) {
      this.recordMediumPulse();
      this.recordShortPulse();
    } else {
      this.recordShortPulse();
      this.recordMediumPulse();
    }
  }

  recordNewDataMarker() {
    this.recordLongPulse();
    this.recordMediumPulse();
  }

  recordEndOfDataMarker() {
    this.recordLongPulse();
    this.recordShortPulse();
  }

  recordPilot(pulses: number) {
    for (let i = 0; i < pulses; i++) {
      this.recordShortPulse();
    }
  }

  recordSyncChain() {
    const syncChain = new Uint8Array([0x89, 0x88, 0x87, 0x86, 0x85, 0x84, 0x83, 0x82, 0x81]);
    this.recordBytes(new BufferAccess(syncChain.buffer));
  }

  recordSyncChainRepeated() {
    const syncChain = new Uint8Array([0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
    this.recordBytes(new BufferAccess(syncChain.buffer));
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

  recordDataWithCheckByte(dataBa: BufferAccess) {
    let checkByte = 0;
    for (let i = 0; i < dataBa.length(); i++) {
      const byte = dataBa.getUint8(i);
      checkByte ^= byte;
      this.recordByte(byte);
    }
    this.recordByte(checkByte);
  }

  recordBasic(startAddress: number, filenameBuffer: string, dataBa: BufferAccess, shortpilot: boolean) {
    // TODO: test
    this.recordBasicOrPrg(fileTypeBasic, startAddress, filenameBuffer, dataBa, shortpilot);
  }

  recordPrg(startAddress: number, filenameBuffer: string, dataBa: BufferAccess, shortpilot: boolean) {
    this.recordBasicOrPrg(fileTypePrg, startAddress, filenameBuffer, dataBa, shortpilot);
  }

  recordData(_filenameBuffer: string, _dataBa: BufferAccess, _shortpilot: boolean) {
    // TODO: implement + test
    throw new InternalError('recordData not implemented yet');
  }

  recordBasicOrPrg(fileType: number, startAddress: number, filenameBuffer: string, dataBa: BufferAccess, shortpilot: boolean) {
    const headerBa = BufferAccess.create(192);
    headerBa.writeUint8(fileType); // 1 byte: file type: prg or basic file
    headerBa.writeUint16Le(startAddress); // 2 bytes: start address
    headerBa.writeUint16Le(startAddress + dataBa.length()); // 2 bytes: end address
    headerBa.writeAsciiString(filenameBuffer); // 16 bytes: filename
    headerBa.writeAsciiString(' '.repeat(171)); // 171 bytes: padding with spaces

    Logger.debug('C64Encoder - recordBasicOrPrg - header:');
    Logger.debug(headerBa.asHexDump());

    // header
    this.recordPilot(shortpilot ? 0x1a00 : 0x6a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();
    // header repeated
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(headerBa);
    this.recordEndOfDataMarker();

    Logger.debug('C64Encoder - recordBasicOrPrg - data:');
    Logger.debug(dataBa.asHexDump());

    // data
    this.recordPilot(0x1a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(dataBa); // include end of data marker
    this.recordEndOfDataMarker();
    // data repeated
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(dataBa); // include end of data marker
    this.recordEndOfDataMarker();
    this.recordPilot(0x4e);
  }
}
