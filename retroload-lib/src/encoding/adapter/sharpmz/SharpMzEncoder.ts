import {ByteRecorder, recordByteMsbFirst, recordBytes} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Oscillator} from '../Oscillator.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

const fLongPulse = 1000;
const fShortPulse = 2000;

/**
 * Encoder for Sharp MZ-700 and similar
 * 
 * https://original.sharpmz.org/mz-700/tapeproc.htm
 * https://original.sharpmz.org/mz-700/coremain.htm
 * 
 * Note: The "L" mark after checksums in this documentation seems not to be required.
 * 
 * Repeating the data seems to be optional: If the first recording can be loaded, the rest is ignored.
 */
export class SharpMzEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(
    private readonly recorder: RecorderInterface,
  ) {
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public recordHeader(header: BufferAccess, repeat: boolean = false, shortpilot: boolean = false): void {
    const checksum = calculateChecksum(header);
    const checksumBuffer = BufferAccess.create(2);
    checksumBuffer.writeUint16Be(checksum);

    // LGAP
    this.oscillator.recordOscillations(fShortPulse, shortpilot ? 5000 : 22000); // "only 10,000 for the MZ-80B"

    // LTM
    this.oscillator.recordOscillations(fLongPulse, 40);
    this.oscillator.recordOscillations(fShortPulse, 40);
    this.oscillator.recordOscillations(fLongPulse, 1);

    // L
    this.oscillator.recordOscillations(fLongPulse, 1);

    // HDR
    this.recorder.beginAnnotation('Header Data');
    this.recordBytes(header);
    this.recorder.endAnnotation();

    // CHKH
    this.recordBytes(checksumBuffer);

    if (repeat) {
      // 256S
      this.oscillator.recordOscillations(fShortPulse, 256);

      // HDRC
      this.recorder.beginAnnotation('Header Data Repeated');
      this.recordBytes(header);
      this.recorder.endAnnotation();

      // CHKH
      this.recordBytes(checksumBuffer);
    }
  }

  public recordData(data: BufferAccess, repeat: boolean = false): void {
    const checksum = calculateChecksum(data);
    const checksumBuffer = BufferAccess.create(2);
    checksumBuffer.writeUint16Be(checksum);

    // SGAP
    this.oscillator.recordOscillations(fShortPulse, 11000);

    // STM
    this.oscillator.recordOscillations(fLongPulse, 20);
    this.oscillator.recordOscillations(fShortPulse, 20);
    this.oscillator.recordOscillations(fLongPulse, 1);

    // L
    this.oscillator.recordOscillations(fLongPulse, 1);

    // FILE
    this.recorder.beginAnnotation('File Data');
    this.recordBytes(data);
    this.recorder.endAnnotation();

    // CHKF
    this.recordBytes(checksumBuffer);

    if (repeat) {
      // 256S
      this.oscillator.recordOscillations(fShortPulse, 256);

      // FILEC
      this.recorder.beginAnnotation('File Data Repeated');
      this.recordBytes(data);
      this.recorder.endAnnotation();

      // CHKF
      this.recordBytes(checksumBuffer);
    }
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
    this.oscillator.recordOscillations(fLongPulse, 1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fLongPulse, 1);
    } else {
      this.oscillator.recordOscillations(fShortPulse, 1);
    }
  }
}

/**
 * sum of 1-bits in data
 */
function calculateChecksum(data: BufferAccess): number {
  let bitSum = 0;
  for (const byte of data.bytes()) {
    for (let i = 0; i < 8; i++) {
      bitSum = (bitSum + ((byte >> i) & 1)) & 0xffff;
    }
  }

  return bitSum;
}
