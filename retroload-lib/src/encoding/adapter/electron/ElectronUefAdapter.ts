import {ElectronEncoder, type ParitySetting} from './ElectronEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {inflate} from 'pako';
import {InputDataError} from '../../../common/Exceptions.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {hex16} from '../../../common/Utils.js';

/**
 * Adapter for Acorn Electron .UEF files
 *
 * http://electrem.emuunlim.com/UEFSpecs.html
 */
const definition: AdapterDefinition = {
  name: 'Acorn Electron .UEF-File',
  internalName: 'uef',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'UEF File!\x00';
const compressedFileHeader = '\x1f\x8b';
const targetMachines = [
  'BBC Model A', // 0
  'Electron', // 1
  'BBC Model B', // ...
  'BBC Master',
  'Atom',
];

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.uef/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader) || ba.containsDataAt(0, compressedFileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const uefBa = uncompressIfRequired(ba);

  if (!uefBa.containsDataAt(0, fileHeader)) {
    throw new InputDataError('File doesn\'t start with expected header.');
  }

  const uefVersionMinor = uefBa.getUint8(10);
  const uefVersionMajor = uefBa.getUint8(11);
  Logger.info(`UEF Version: ${uefVersionMajor}.${uefVersionMinor}`);

  const e = new ElectronEncoder(recorder);
  const uefProcessor = new UefProcessor(e);
  uefProcessor.processUef(uefBa);
}

class UefProcessor {
  constructor(private readonly e: ElectronEncoder) {
  }

  public processUef(uefBa: BufferAccess) {
    this.e.begin();
    let chunkOffset = 12;
    while (chunkOffset < uefBa.length()) {
      const chunkType = uefBa.getUint16Le(chunkOffset);
      const chunkLength = uefBa.getUint32Le(chunkOffset + 2);
      const chunkBa = uefBa.slice(chunkOffset + 6, chunkLength);
      Logger.debug(`Chunk - Offset: 0x${chunkOffset.toString(16)} Type: ${hex16(chunkType)} Length: ${hex16(chunkLength)}`);
      Logger.debug(chunkBa.asHexDump());
      this.processChunk(chunkType, chunkBa);
      chunkOffset += chunkLength + 6;
    }
    this.e.end();
  }

  // eslint-disable-next-line complexity
  private processChunk(chunkType: number, chunkBa: BufferAccess): void {
    switch (chunkType) {
      case 0x0000: // origin information chunk
        Logger.info(`Origin: ${extractString(chunkBa)}`);
        break;
      case 0x0001: // game instructions / manual or URL
        Logger.info(`Instructions: ${extractString(chunkBa)}`);
        break;
      case 0x0003: // inlay scan
        Logger.info(`Chunk type ${hex16(chunkType)} (inlay scan) not implemented.`);
        break;
      case 0x0005: // target machine chunk
      {
        const targetMachine = chunkBa.getUint8(0);
        const targetMachineName = targetMachines[targetMachine >> 4];
        const keyConfig = targetMachine & 0x0f;
        Logger.info(`Target machine: ${targetMachine}` + (targetMachine === undefined ? '' : ` (${targetMachineName}) Keyboard configuration: ${keyConfig}`));
        break;
      }
      case 0x0006: // bit multiplexing information
        Logger.info(`Chunk type ${hex16(chunkType)} (bit multiplexing information) not implemented.`);
        break;
      case 0x0007: // extra palette
        Logger.info(`Chunk type ${hex16(chunkType)} (extra palette) not implemented.`);
        break;
      case 0x0008: // ROM hint
        Logger.info(`Chunk type ${hex16(chunkType)} (ROM hint) not implemented.`);
        break;
      case 0x0009: // short title
        Logger.info(`Short title: ${extractString(chunkBa)}`);
        break;
      case 0x00a: // visible area
        Logger.info(`Chunk type ${hex16(chunkType)} (visible area) not implemented.`);
        break;
      case 0x0100: // implicit start/stop bit tape data block
        this.e.recordBytes(chunkBa);
        break;
      case 0x0101: // multiplexed data block
        Logger.error(`Chunk type ${hex16(chunkType)} (multiplexed data block) not implemented.`);
        break;
      case 0x0102: // explicit tape data block
        Logger.error(`Chunk type ${hex16(chunkType)} (explicit tape data block) not implemented.`);
        break;
      case 0x0104: // defined tape format data block
      {
        Logger.info('TODO: Check if 0x0104 defined tape format data block works');
        const dataBits = chunkBa.getUint8(0);
        const parity = determineParitySetting(chunkBa.getUint8(1));
        const stopBits = determineStopBits(chunkBa.getUint8(2));
        Logger.debug(`Custom block: Data bits: ${dataBits} Parity: ${parity} Stop bits: ${stopBits}`);
        const dataBa = chunkBa.slice(3);
        for (let i = 0; i < dataBa.length(); i++) {
          this.e.recordByte(dataBa.getUint8(i), dataBits, parity, stopBits); // TODO: check this stuff
        }
        break;
      }
      case 0x0110: // carrier tone
      {
        const oscillations = chunkBa.getUint16Le(0);
        Logger.debug(`Carrier tone: ${oscillations} oscillations`);
        this.e.recordCarrier(oscillations);
        break;
      }
      case 0x0111: // carrier tone with dummy byte
      {
        const cyclesBefore = chunkBa.getUint16Le(0);
        const cyclesAfter = chunkBa.getUint16Le(2);
        Logger.debug(`Carrier tone with dummy byte. Cycles before: ${cyclesBefore} after: ${cyclesAfter}`);
        this.e.recordCarrier(cyclesBefore);
        this.e.recordByte(0xaa); // dummy byte
        this.e.recordCarrier(cyclesAfter);
        break;
      }
      case 0x0112: // integer gap
      {
        const gap = chunkBa.getUint16Le(0);
        Logger.debug(`Integer gap: ${gap}`);
        this.e.recordGap(gap);
        break;
      }
      case 0x0113: // change of base frequency
      {
        const frequency = chunkBa.getFloat32Le(0);
        Logger.debug(`Base frequency change to: ${frequency} Hz`);
        this.e.setBaseFrequency(frequency);
        break;
      }
      case 0x0114: // security cycles
      {
        // https://github.com/haerfest/uef/blob/master/uef2wave.py
        const cycles = (chunkBa.getUint16Le(1) << 8) | chunkBa.getUint8(0); // 24 bit value
        const firstCycleMode = String.fromCharCode(chunkBa.getUint8(3));
        const lastCycleMode = String.fromCharCode(chunkBa.getUint8(4));
        Logger.debug(`Security cycles: ${cycles} first: ${firstCycleMode} last: ${lastCycleMode}`);
        // Logger.error(`Chunk type ${hex16(chunkType)} (security cycles) not implemented.`);
        // TODO: test it
        break;
      }
      case 0x0115: // phase change
        Logger.error(`Chunk type ${hex16(chunkType)} (phase change) not implemented.`);
        break;
      case 0x0116: // floating point gap
      {
        const gapS = chunkBa.getFloat32Le(0);
        Logger.debug(`Floating point gap: ${gapS} s`);
        this.e.recordSilenceMs(gapS * 1000);
        break;
      }
      case 0x0117: // data encoding format change
        Logger.error(`Chunk type ${hex16(chunkType)} (data encoding format change) not implemented.`);
        break;
      case 0x0120: // position marker
        Logger.info(`Position marker: ${extractString(chunkBa)}`);
        break;
      case 0x0130: // tape set info
        Logger.error(`Chunk type ${hex16(chunkType)} (tape set info) not implemented.`);
        break;
      case 0x0131: // start of tape side
        Logger.error(`Chunk type ${hex16(chunkType)} (start of tape side) not implemented.`);
        break;
      // Other chunk types are not tape related
      case 0x0200: // disc info
      case 0x0201: // single implicit disc side
      case 0x0202: // multiplexed disc side
      case 0x0300: // standard machine rom
      case 0x0301: // multiplexed machine rom
      case 0x0400: // 6502 standard state
      case 0x0401: // Electron ULA state
      case 0x0402: // WD1770 state
      case 0x0403: // JIM paging register state
      case 0x0410: // standard memory data
      case 0x0411: // multiplexed memory data
      case 0x0412: // multiplexed (partial) 6502 state
      case 0x0420: // Slogger Master RAM Board State
      default:
        Logger.error(`Chunk type ${hex16(chunkType)} not implemented.`);
        break;
    }
  }
}

function uncompressIfRequired(ba: BufferAccess) {
  return ba.containsDataAt(0, compressedFileHeader) ? BufferAccess.createFromUint8Array(inflate(ba.asUint8Array())) : ba;
}

function extractString(ba: BufferAccess): string {
  return ba.slice(0, ba.length() - 1).asAsciiString(); // remove trailing \0
}

function determineParitySetting(c: number): ParitySetting {
  const str = String.fromCharCode(c);
  if (str !== 'N' && str !== 'E' && str !== 'O') {
    Logger.error('Invalid value for parity setting. Falling back to no parity.');
    return 'N';
  }

  return str;
}

function determineStopBits(n: number): number {
  // n is unsigned, so > 127 means it's a negative value
  if (n > 127) {
    // "If it is a negative number then it is a negatived count of stop bits to which an extra short wave should be added."
    // "Emulator authors seeking simplicity may ignore any chunk that deals with the tape wave form at pulse or cycle level
    // and rationalise chunk &0104 to a whole number of stop bits while retaining 99.9% compatibility with real world UEFs."
    Logger.error('Extra short waves for stop bits are not supported. Falling back to normal stop bits.');
    return -128 + n + 1;
  }

  return n;
}
