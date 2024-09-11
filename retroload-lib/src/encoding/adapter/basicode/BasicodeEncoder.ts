import {type BufferAccess} from '../../../common/BufferAccess.js';
import {hex8} from '../../../common/Utils.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {recordByteLsbFirst, type ByteRecorder} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';

const fZero = 1200;
const fOne = 2400;

const stx = 0x02;
const sth = 0x01;
const etx = 0x03;

/**
 * Encoder for BASICODE
 *
 * Format description:
 * - The Chip Shop - Basicode 2 - p. 8
 * - http://www.kc85emu.de/scans/rfe0190/Basicode.htm
 * - https://github.com/robhagemans/basicode/blob/master/BASICODE.rst
 */
export class BasicodeEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  constructor(
    private readonly recorder: RecorderInterface,
    private readonly shortpilot = false,
  ) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.recordSilence(this.recorder.sampleRate / 2);
  }

  public recordBasicProgram(ba: BufferAccess): void {
    this.record(ba, stx);
  }

  public recordBasicData(ba: BufferAccess): void {
    for (const chunkBa of ba.chunksPadded(1024, sth)) {
      this.recorder.beginAnnotation('Chunk');
      this.record(chunkBa, sth);
      this.recorder.endAnnotation();
    }
  }

  public recordByte(byte: number): void {
    this.recordBit(0);
    recordByteLsbFirst(this, 0x80 | byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fOne, 2);
    } else {
      this.oscillator.recordOscillations(fZero, 1);
    }
  }

  private record(ba: BufferAccess, startMarker: number): void {
    this.oscillator.recordOscillations(fOne, fOne * (this.shortpilot ? 3 : 5));

    let checksum = 0;

    checksum ^= startMarker;
    this.recordByte(startMarker);

    // ASCII bytes
    for (let asciiByte of ba.bytes()) {
      if (asciiByte === 0x0a) {
        // replace '\n' with '\r' as required by BASICODE
        asciiByte = 0x0d;
      }
      checksum ^= asciiByte;
      this.recordByte(asciiByte);
    }

    checksum ^= etx;
    this.recordByte(etx);

    Logger.debug(`Checksum: ${hex8(checksum)}`);
    this.recordByte(checksum);

    this.oscillator.recordOscillations(fOne, fOne); // 1 s
  }
}
