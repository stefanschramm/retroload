import {InputDataError} from '../exception.js';

const tzxHeaderLength = 0x0a;

const standardSpeedRecordOptions = {
  // ZX Spectrum defaults (for non-turbo-speed-data blocks)
  // TODO: Put into encoder? - Required by TzxProcessor and TapAdapter!
  pauseLengthMs: 1000,
  pilotPulseLength: 2168,
  syncFirstPulseLength: 667,
  syncSecondPulseLength: 735,
  zeroBitPulseLength: 855,
  oneBitPulseLength: 1710,
  lastByteUsedBits: 8,
};

/**
 * .TZX file processor used for ZX Spectrum and Amstract CPC
 *
 *  additional layer between adapter and encoder
 */
export class TzxProcessor {
  /**
   * @param {TzxEncoder} encoder
   */
  constructor(encoder) {
    this.e = encoder;
  }

  processTzx(dataView) {
    // TODO: get version offset: 0x08 length: 2
    let i = tzxHeaderLength;
    this.e.begin();
    while (i < dataView.byteLength) {
      const blockId = dataView.getUint8(i++);
      const blockDv = dataView.referencedSlice(i);
      i += this.processBlock(blockId, blockDv);
    }
    this.e.end();
  }

  processBlock(blockId, blockDv) {
    // Block recording methods return the block size in input file (excluding ID byte)
    switch (blockId) {
      case 0x10:
        return this.processStandardSpeedDataBlock(blockDv);
      case 0x11:
        return this.processTurboSpeedDataBlock(blockDv);
      case 0x12:
        return this.processPureToneBlock(blockDv);
      case 0x13:
        return this.processPulseSequenceBlock(blockDv);
      case 0x14:
        return this.processPureDataBlock(blockDv);
      case 0x20:
        return this.processPauseBlock(blockDv);
      case 0x30:
        return this.processTextDescriptionBlock(blockDv);
      case 0x31:
        return this.processMessageBlock(blockDv);
      case 0x32:
        return this.processArchiveInfoBlock(blockDv);
      case 0x33:
        return this.processHardwareTypeBlock(blockDv);
      case 0x5a:
        return this.processGlueBlock(blockDv);
      case 0x15: // Direct Recording
      case 0x18: // CSW Recording
      case 0x21: // Group start
      case 0x3c: // ?
      case 0x79: // ?
        // I've seen these block types in .cdt files, but they're not implemented yet.
        throw new InputDataError(`Unimplemented TZX/CDT block type: 0x${blockId.toString(16)}. This file is currently not supported.`);
      default:
        throw new InputDataError(`Unknown TZX/CDT block type: 0x${blockId.toString(16)}`);
        // TODO: General Extension Rule: ALL custom blocks that will be added after version 1.10 will have the length of the block in first 4 bytes (long word) after the ID (this length does not include these 4 length bytes). This should enable programs that can only handle older versions to skip that block.
    }
  }

  processStandardSpeedDataBlock(dv) {
    // ID 0x10
    const blockHeaderLength = 0x04;
    const dataLength = dv.getUint16(0x02, true);
    const blockDataDv = dv.referencedSlice(blockHeaderLength, dataLength);

    this.e.recordDataBlock(blockDataDv, {
      ...standardSpeedRecordOptions,
      pauseLengthMs: dv.getUint16(0x00, true),
      pilotPulses: blockDataDv.getUint8(0) < 128 ? 8063 : 3223,
    });

    return blockHeaderLength + dataLength;
  }

  processTurboSpeedDataBlock(dv) {
    // ID 0x11
    const blockHeaderLength = 0x12;
    const dataLength =
      dv.getUint8(0x0f) +
      dv.getUint8(0x10) * 2 ** 8 +
      dv.getUint8(0x11) * 2 ** 16
    ;
    const blockDataDv = dv.referencedSlice(blockHeaderLength, dataLength);

    this.e.recordDataBlock(blockDataDv, {
      pilotPulseLength: dv.getUint16(0x00, true),
      syncFirstPulseLength: dv.getUint16(0x02, true),
      syncSecondPulseLength: dv.getUint16(0x04, true),
      zeroBitPulseLength: dv.getUint16(0x06, true),
      oneBitPulseLength: dv.getUint16(0x08, true),
      pilotPulses: dv.getUint16(0x0a, true),
      lastByteUsedBits: dv.getUint8(0x0c),
      pauseLengthMs: dv.getUint16(0x0d, true),
    });

    return blockHeaderLength + dataLength;
  }

  processPureToneBlock(dv) {
    // ID 0x12
    const pulseLength = dv.getUint16(0, true);
    const numberOfPulses = dv.getUint16(2, true);
    for (let i = 0; i < numberOfPulses; i++) {
      this.e.recordPulse(pulseLength);
    }

    return 4;
  }

  processPulseSequenceBlock(dv) {
    // ID 0x13
    const numberOfPulses = dv.getUint8(0);
    for (let i = 0; i < numberOfPulses; i++) {
      const pulseLength = dv.getUint16(1 + 2 * i, true);
      this.e.recordPulse(pulseLength);
    }

    return 1 + 2 * numberOfPulses;
  }

  processPureDataBlock(dv) {
    // ID 0x14
    const blockHeaderLength = 0x0a;
    const dataLength =
      dv.getUint8(0x07) +
      dv.getUint8(0x08) * 2 ** 8 +
      dv.getUint8(0x09) * 2 ** 16
    ;
    const blockDataDv = dv.referencedSlice(blockHeaderLength, dataLength);

    this.e.recordPureDataBlock(blockDataDv, {
      zeroBitPulseLength: dv.getUint16(0x00, true),
      oneBitPulseLength: dv.getUint16(0x02, true),
      lastByteUsedBits: dv.getUint8(0x04),
      pauseLengthMs: dv.getUint16(0x05, true),
    });

    return blockHeaderLength + dataLength;
  }

  processPauseBlock(dv) {
    // ID 0x20
    const length = dv.getUint16(0, true);
    this.e.recordSilenceMs(length);

    return 2;
  }

  processTextDescriptionBlock(dv) {
    // ID 0x30
    // For now just ignore block
    const length = dv.getUint8(0);

    return 1 + length;
  }

  processMessageBlock(dv) {
    // ID 0x31
    // For now just ignore block
    const messageLength = dv.getUint8(1);

    return 2 + messageLength;
  }

  processArchiveInfoBlock(dv) {
    // ID 0x32
    // For now just ignore block
    const length = dv.getUint16(0, true);

    return 2 + length;
  }

  processHardwareTypeBlock(dv) {
    // ID 0x33
    // For now just ignore block
    const entries = dv.getUint8(0);

    return 1 + entries * 3;
  }

  processGlueBlock(dv) {
    // ID 0x5a
    // Just ignore
    return 9;
  }
}
