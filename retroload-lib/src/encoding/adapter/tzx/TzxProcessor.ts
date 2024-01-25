import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type KansasCityLikeConfiguration, type AbstractTzxEncoder} from '../AbstractTzxEncoder.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {hex8} from '../../../common/Utils.js';

const tzxHeaderLength = 0x0a;

/**
 * .TZX file processor used for ZX Spectrum, Amstrad CPC and MSX
 *
 * additional layer between adapter and encoder
 *
 * Format descriptions:
 * - TZX (ZX Spectrum): http://k1.spdns.de/Develop/Projects/zasm/Info/TZX%20format.html
 * - CDT (Amstrad CPC): https://www.cpcwiki.eu/index.php/Format:CDT_tape_image_file_format
 * - TSX (MSX / Kansas City Standard): https://github.com/nataliapc/makeTSX/wiki/Tutorial-How-to-generate-TSX-files
 */
export class TzxProcessor {
  constructor(private readonly encoder: AbstractTzxEncoder) {
  }

  processTzx(ba: BufferAccess) {
    // TODO: get version offset: 0x08 length: 2
    let i = tzxHeaderLength;
    this.encoder.begin();
    while (i < ba.length()) {
      const blockId = ba.getUint8(i++);
      const blockBa = ba.slice(i);
      i += this.processBlock(blockId, blockBa);
    }
    this.encoder.end();
  }

  processBlock(blockId: number, blockBa: BufferAccess) {
    // Block recording methods return the block size in input file (excluding ID byte)
    Logger.debug(`TZX Block id: ${hex8(blockId)}`);
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
      case 0x21:
        return this.processGroupStartBlock(blockBa);
      case 0x22:
        return this.processGroupEndBlock(blockBa);
      case 0x30:
        return this.processTextDescriptionBlock(blockBa);
      case 0x31:
        return this.processMessageBlock(blockBa);
      case 0x32:
        return this.processArchiveInfoBlock(blockBa);
      case 0x33:
        return this.processHardwareTypeBlock(blockBa);
      case 0x35:
        return this.processCustomInfoBlock(blockBa);
      case 0x4b:
        return this.processKansasCityLikeBlock(blockBa);
      case 0x5a:
        return this.processGlueBlock(blockBa);
      case 0x15: // Direct Recording
      case 0x18: // CSW Recording
      case 0x3c: // ?
      case 0x79: // ?
        // I've seen these block types in .cdt files, but they're not implemented yet.
        throw new InputDataError(`Unimplemented TZX/CDT block type: ${hex8(blockId)}. This file is currently not supported.`);
      default:
        Logger.error(`Skipping Unknown TZX/CDT block type: ${hex8(blockId)}`);
        return this.processUnknownBlock(blockBa);
    }
  }

  private processStandardSpeedDataBlock(ba: BufferAccess) {
    // ID 0x10
    const blockHeaderLength = 0x04;
    const dataLength = ba.getUint16Le(0x02);
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.encoder.recordDataBlock(blockDataBa, {
      ...this.encoder.getStandardSpeedRecordOptions(),
      pauseLengthMs: ba.getUint16Le(0x00),
      pilotPulses: blockDataBa.getUint8(0) < 128 ? 8063 : 3223,
    });

    return blockHeaderLength + dataLength;
  }

  private processTurboSpeedDataBlock(ba: BufferAccess) {
    // ID 0x11
    const blockHeaderLength = 0x12;
    const dataLength = ba.getUint8(0x0f) + ba.getUint8(0x10) * 2 ** 8 + ba.getUint8(0x11) * 2 ** 16;
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.encoder.recordDataBlock(blockDataBa, {
      pilotPulseLength: ba.getUint16Le(0x00),
      syncFirstPulseLength: ba.getUint16Le(0x02),
      syncSecondPulseLength: ba.getUint16Le(0x04),
      zeroBitPulseLength: ba.getUint16Le(0x06),
      oneBitPulseLength: ba.getUint16Le(0x08),
      pilotPulses: ba.getUint16Le(0x0a),
      lastByteUsedBits: ba.getUint8(0x0c),
      pauseLengthMs: ba.getUint16Le(0x0d),
    });

    return blockHeaderLength + dataLength;
  }

  private processPureToneBlock(ba: BufferAccess) {
    // ID 0x12
    const pulseLength = ba.getUint16Le(0);
    const numberOfPulses = ba.getUint16Le(2);
    this.encoder.recordPulses(pulseLength, numberOfPulses);

    return 4;
  }

  private processPulseSequenceBlock(ba: BufferAccess) {
    // ID 0x13
    const numberOfPulses = ba.getUint8(0);
    for (let i = 0; i < numberOfPulses; i++) {
      const pulseLength = ba.getUint16Le(1 + 2 * i);
      this.encoder.recordPulse(pulseLength);
    }

    return 1 + 2 * numberOfPulses;
  }

  private processPureDataBlock(ba: BufferAccess) {
    // ID 0x14
    const blockHeaderLength = 0x0a;
    const dataLength = ba.getUint8(0x07) + ba.getUint8(0x08) * 2 ** 8 + ba.getUint8(0x09) * 2 ** 16;
    const blockDataBa = ba.slice(blockHeaderLength, dataLength);

    this.encoder.recordPureDataBlock(blockDataBa, {
      zeroBitPulseLength: ba.getUint16Le(0x00),
      oneBitPulseLength: ba.getUint16Le(0x02),
      lastByteUsedBits: ba.getUint8(0x04),
      pauseLengthMs: ba.getUint16Le(0x05),
    });

    return blockHeaderLength + dataLength;
  }

  private processPauseBlock(ba: BufferAccess) {
    // ID 0x20
    const length = ba.getUint16Le(0);
    this.encoder.recordSilenceMs(length);

    return 2;
  }

  private processGroupStartBlock(ba: BufferAccess) {
    // ID 0x21
    const length = ba.getUint8(0x00);
    const groupName = ba.slice(1, length).asAsciiString();
    Logger.info(`TZX Group start: ${groupName}`);

    return 1 + length;
  }

  private processGroupEndBlock(_ba: BufferAccess) {
    // ID 0x22
    Logger.info('TZX Group end.');

    return 0;
  }

  private processTextDescriptionBlock(ba: BufferAccess) {
    // ID 0x30
    // For now just ignore block
    const length = ba.getUint8(0);

    return 1 + length;
  }

  private processMessageBlock(ba: BufferAccess) {
    // ID 0x31
    // For now just ignore block
    const messageLength = ba.getUint8(1);

    return 2 + messageLength;
  }

  private processArchiveInfoBlock(ba: BufferAccess) {
    // ID 0x32
    const length = ba.getUint16Le(0);
    const archiveInfoData = ba.slice(0x02, length);
    // It could be further destructured, but for now just hexdump it.
    Logger.info('TZX Archive info block');
    Logger.info(archiveInfoData.asHexDump());

    return 2 + length;
  }

  private processHardwareTypeBlock(ba: BufferAccess) {
    // ID 0x33
    // For now just ignore block
    const entries = ba.getUint8(0);

    return 1 + entries * 3;
  }

  private processCustomInfoBlock(ba: BufferAccess) {
    // ID 0x35
    // Note: The TZX tech specs says CHAR[10]	as length for the ident string, but it's actually CHAR[0x10]
    const identificationString = ba.slice(0, 0x10).asAsciiString();
    const length = ba.getUint32Le(0x10);
    Logger.info(`TZX Custom info block - Identification string: ${identificationString}`);
    const customInfoData = ba.slice(0x14, length);
    Logger.info(customInfoData.asHexDump());

    return 0x10 + 4 + length;
  }

  /**
   * MSX / Kansas City Standard-like extension of TZX format (TSX)
   *
   * https://github.com/nataliapc/makeTSX/wiki/Tutorial-How-to-generate-TSX-files#14-the-new-4b-block
   */
  private processKansasCityLikeBlock(ba: BufferAccess) {
    // ID 0x4b
    const length = ba.getUint32Le(0x00);

    const pauseAfterBlockMs = ba.getUint16Le(0x04);
    const pilotPulseDuration = ba.getUint16Le(0x06);
    const pilotPulses = ba.getUint16Le(0x08);
    const zeroPulseDuration = ba.getUint16Le(0x0a);
    const onePulseDuration = ba.getUint16Le(0x0c);
    const bitPulseConfiguration = ba.getUint8(0x0e); // aaaabbbb
    const rawZeroPulsesInZeroBit = (bitPulseConfiguration >> 4) & 0b00001111; // aaaa
    const rawOnePulsesInZeroBit = bitPulseConfiguration & 0b00001111; // bbbb
    const bitConfiguration = ba.getUint8(0x0f); // aabccdef

    const config: KansasCityLikeConfiguration = {
      pauseAfterBlockMs,
      pilotPulseLength: pilotPulseDuration,
      pilotPulses,
      zeroPulseLength: zeroPulseDuration,
      onePulseLength: onePulseDuration,
      zeroPulsesInZeroBit: rawZeroPulsesInZeroBit === 0 ? 16 : rawZeroPulsesInZeroBit,
      onePulsesInOneBit: rawOnePulsesInZeroBit === 0 ? 16 : rawOnePulsesInZeroBit,
      startBitCount: (bitConfiguration >> 6) & 0b011, // aa
      startBitValue: ((bitConfiguration >> 5) & 1) === 1 ? 1 : 0, // b
      stopBitCount: (bitConfiguration >> 3) & 0b011, // cc
      stopBitValue: ((bitConfiguration >> 2) & 1) === 1 ? 1 : 0, // d
      msbFirst: (bitConfiguration & 1) === 1, // f
    };

    const dataBa = ba.slice(0x10, length - 12);

    this.encoder.recordKansasCityLikeBlock(dataBa, config);

    return 4 + length;
  }

  private processGlueBlock(_ba: BufferAccess) {
    // ID 0x5a
    // Just ignore
    return 9;
  }

  /**
   * Skip unknown block type
   *
   * General Extension Rule: ALL custom blocks that will be added after
   * version 1.10 will have the length of the block in first 4 bytes
   * (long word) after the ID (this length does not include these 4 length
   * bytes). This should enable programs that can only handle older
   * versions to skip that block.
   */
  private processUnknownBlock(ba: BufferAccess) {
    const length = ba.getUint32Le(0x00);
    const data = ba.slice(1, length);
    Logger.debug(data.asHexDump());

    return 4 + length;
  }
}
