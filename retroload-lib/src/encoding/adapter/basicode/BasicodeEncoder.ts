import {type BufferAccess} from '../../../common/BufferAccess.js';
import {hex8} from '../../../common/Utils.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {AbstractEncoder} from '../AbstractEncoder.js';

const fZero = 1200;
const fOne = 2400;

const stx = 0x02;
const sth = 0x01;
const etx = 0x03;

/**
 * Encoder for LC 80
 *
 * Format description:
 * - The Chip Shop - Basicode 2 - p. 8
 * - http://www.kc85emu.de/scans/rfe0190/Basicode.htm
 * - https://github.com/robhagemans/basicode/blob/master/BASICODE.rst
 */
export class BasicodeEncoder extends AbstractEncoder {
  static override getTargetName() {
    return 'basicode';
  }

  constructor(
    recorder: RecorderInterface,
    private readonly shortpilot = false,
  ) {
    super(recorder);
  }

  override end() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  public recordBasicProgram(ba: BufferAccess) {
    this.record(ba, stx);
  }

  public recordBasicData(ba: BufferAccess) {
    for (const chunkBa of ba.chunksPadded(1024, sth)) {
      this.record(chunkBa, sth);
    }
  }

  override recordByte(byte: number) {
    this.recordBit(0);
    super.recordByte(0x80 | byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne, 2);
    } else {
      this.recordOscillations(fZero, 1);
    }
  }

  private record(ba: BufferAccess, startMarker: number) {
    this.recordOscillations(fOne, fOne * (this.shortpilot ? 3 : 5));

    let checksum = 0;

    checksum ^= startMarker;
    this.recordByte(startMarker);

    // ASCII bytes
    for (let i = 0; i < ba.length(); i++) {
      let asciiByte = ba.getUint8(i);
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

    this.recordOscillations(fOne, fOne); // 1 s
  }
}
