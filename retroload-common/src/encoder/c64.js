import {BaseEncoder} from './base.js';
import {ExtDataView} from '../utils.js';

// https://www.c64-wiki.com/wiki/Datassette_Encoding

const palClockCycles = 985248;

// const fileTypeBasic = 0x01;
// const fileTypeSeqFileDataBlock = 0x02;
const fileTypePrg = 0x03;
// const fileTypeSeqFileHeader = 0x04;
// const fileTypeEndOfTapeMarker = 0x05;

/**
 * Encoder for C64 and VIC-20. Used for encoding .prg and .tap files.
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'c64';
  }

  recordPulse(pulseLength) {
    // Note: The .tap file adapter uses recordPulse directly.
    const samples = Math.ceil((0.5 * this.recorder.sampleRate * pulseLength) / palClockCycles);
    for (const value of [true, false]) {
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

  recordBit(value) {
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

  recordPilot(pulses) {
    for (let i = 0; i < pulses; i++) {
      this.recordShortPulse();
    }
  }

  recordSyncChain() {
    const syncChain = new Uint8Array([0x89, 0x88, 0x87, 0x86, 0x85, 0x84, 0x83, 0x82, 0x81]);
    this.recordBytes(new DataView(syncChain.buffer));
  }

  recordSyncChainRepeated() {
    const syncChain = new Uint8Array([0x09, 0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01]);
    this.recordBytes(new DataView(syncChain.buffer));
  }

  recordByte(byte) {
    this.recordNewDataMarker();
    let checkBit = 1;
    for (let i = 0; i < 8; i += 1) {
      const bit = ((byte & (1 << i)) === 0) ? 0 : 1;
      checkBit = checkBit ^ bit;
      this.recordBit(bit);
    }
    this.recordBit(checkBit);
  }

  recordDataWithCheckByte(data) {
    let checkByte = 0;
    for (let i = 0; i < data.byteLength; i++) {
      const byte = data.getUint8(i);
      checkByte = checkByte ^ byte;
      this.recordByte(byte);
    }
    this.recordByte(checkByte);
  }

  recordPrg(startAddress, filenameBuffer, dataDv) {
    const headerBuffer = new ArrayBuffer(192);
    const headerDv = new ExtDataView(headerBuffer);
    headerDv.setUint8(0, fileTypePrg); // 1 byte: file type: prg file
    headerDv.setUint16(1, startAddress, true); // 2 bytes: start address
    headerDv.setUint16(3, startAddress + dataDv.byteLength, true); // 2 bytes: end address
    headerDv.setString(5, filenameBuffer); // 16 bytes: filename
    headerDv.setString(21, ' '.repeat(171)); // 171 bytes: padding with spaces

    // header
    this.recordPilot(0x6a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(headerDv);
    this.recordEndOfDataMarker();
    // header repeated
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(headerDv);
    this.recordEndOfDataMarker();
    // data
    this.recordPilot(0x1a00);
    this.recordSyncChain();
    this.recordDataWithCheckByte(dataDv); // include end of data marker
    this.recordEndOfDataMarker();
    // data repeated
    this.recordPilot(0x4f);
    this.recordSyncChainRepeated();
    this.recordDataWithCheckByte(dataDv); // include end of data marker
    this.recordEndOfDataMarker();
    this.recordPilot(0x4e);
  }
}
