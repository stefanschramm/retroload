import {InputDataError} from '../exception.js';
import {Logger} from '../logger.js';

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

  processTzx(ba) {
    // TODO: get version offset: 0x08 length: 2
    let i = tzxHeaderLength;
    this.e.begin();
    while (i < ba.length()) {
      const blockId = ba.getUint8(i++);
      const blockBa = ba.slice(i);
      i += this.processBlock(blockId, blockBa);
    }
    this.e.end();
  }

  processBlock(blockId, blockBa) {
    // Block recording methods return the block size in input file (excluding ID byte)
    Logger.debug(`TZX Block id: 0x${blockId.toString(16)}`);
    switch (blockId) {
      case 0x10:
        return this.processStandardSpeedDataBlock(blockBa);
      case 0x11:
        return this.processTurboSpeedDataBlock(blockBa);
      case 0x12:
        return this.processPureToneBlock(blockBa);
      case 0x13:
        return this.processPulseSequenceBlock(blockBa);
      case 0x14:
        return this.processPureDataBlock(blockBa);
      case 0x20:
        return this.processPauseBlock(blockBa);
      case 0x30:
        return this.processTextDescriptionBlock(blockBa);
      case 0x31:
        return this.processMessageBlock(blockBa);
      case 0x32:
        return this.processArchiveInfoBlock(blockBa);
      case 0x33:
        return this.processHardwareTypeBlock(blockBa);
      case 0x5a:
        return this.processGlueBlock(blockBa);
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

  processStandardSpeedDataBlock(ba) {
    // ID 0x10
    const blockHeaderLength = 0x04;
    const dataLength = ba.getUint16LE(0x02);
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.e.recordDataBlock(blockDataBa, {
      ...standardSpeedRecordOptions,
      pauseLengthMs: ba.getUint16LE(0x00),
      pilotPulses: blockDataBa.getUint8(0) < 128 ? 8063 : 3223,
    });

    return blockHeaderLength + dataLength;
  }

  processTurboSpeedDataBlock(ba) {
    // ID 0x11
    const blockHeaderLength = 0x12;
    const dataLength =
      ba.getUint8(0x0f) +
      ba.getUint8(0x10) * 2 ** 8 +
      ba.getUint8(0x11) * 2 ** 16
    ;
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.e.recordDataBlock(blockDataBa, {
      pilotPulseLength: ba.getUint16LE(0x00),
      syncFirstPulseLength: ba.getUint16LE(0x02),
      syncSecondPulseLength: ba.getUint16LE(0x04),
      zeroBitPulseLength: ba.getUint16LE(0x06),
      oneBitPulseLength: ba.getUint16LE(0x08),
      pilotPulses: ba.getUint16LE(0x0a),
      lastByteUsedBits: ba.getUint8(0x0c),
      pauseLengthMs: ba.getUint16LE(0x0d),
    });

    return blockHeaderLength + dataLength;
  }

  processPureToneBlock(ba) {
    // ID 0x12
    const pulseLength = ba.getUint16LE(0);
    const numberOfPulses = ba.getUint16LE(2);
    for (let i = 0; i < numberOfPulses; i++) {
      this.e.recordPulse(pulseLength);
    }

    return 4;
  }

  processPulseSequenceBlock(ba) {
    // ID 0x13
    const numberOfPulses = ba.getUint8(0);
    for (let i = 0; i < numberOfPulses; i++) {
      const pulseLength = ba.getUint16LE(1 + 2 * i);
      this.e.recordPulse(pulseLength);
    }

    return 1 + 2 * numberOfPulses;
  }

  processPureDataBlock(ba) {
    // ID 0x14
    const blockHeaderLength = 0x0a;
    const dataLength =
      ba.getUint8(0x07) +
      ba.getUint8(0x08) * 2 ** 8 +
      ba.getUint8(0x09) * 2 ** 16
    ;
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.e.recordPureDataBlock(blockDataBa, {
      zeroBitPulseLength: ba.getUint16LE(0x00),
      oneBitPulseLength: ba.getUint16LE(0x02),
      lastByteUsedBits: ba.getUint8(0x04),
      pauseLengthMs: ba.getUint16LE(0x05),
    });

    return blockHeaderLength + dataLength;
  }

  processPauseBlock(ba) {
    // ID 0x20
    const length = ba.getUint16LE(0);
    this.e.recordSilenceMs(length);

    return 2;
  }

  processTextDescriptionBlock(ba) {
    // ID 0x30
    // For now just ignore block
    const length = ba.getUint8(0);

    return 1 + length;
  }

  processMessageBlock(ba) {
    // ID 0x31
    // For now just ignore block
    const messageLength = ba.getUint8(1);

    return 2 + messageLength;
  }

  processArchiveInfoBlock(ba) {
    // ID 0x32
    // For now just ignore block
    const length = ba.getUint16LE(0);

    return 2 + length;
  }

  processHardwareTypeBlock(ba) {
    // ID 0x33
    // For now just ignore block
    const entries = ba.getUint8(0);

    return 1 + entries * 3;
  }

  processGlueBlock(ba) {
    // ID 0x5a
    // Just ignore
    return 9;
  }
}
