import {type ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {calculateChecksum8} from '../../../common/Utils.js';

const fShort = 2000;
const fLong = 1000;
const fSyncIntro = 1000;
const syncIntroLength = 4; // s
const syncIntroLengthShort = 1; // s
const fSyncMid = 2000;
const syncMidLength = 2; // s
const fSyncEnd = 2000;
const syncEndLength = 2; // s

/**
 * Encoder for LC 80
 *
 * Format description: Bedienungsanleitung LC 80, p. 24-25
 */
export class Lc80Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(
    recorder: RecorderInterface,
    private readonly shortpilot: boolean,
  ) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
    this.oscillator.recordSeconds(fSyncIntro, this.shortpilot ? syncIntroLengthShort : syncIntroLength);
  }

  public recordHeader(fileNumber: number, startAddress: number, endAddress: number): void {
    // The "file name" gets written to the tape in reverse order.
    // So it's rather a little-endian file number than a name.
    const headerBa = BufferAccess.create(6);
    headerBa.writeUint16Le(fileNumber);
    headerBa.writeUint16Le(startAddress);
    headerBa.writeUint16Le(endAddress);
    recordBytes(this, headerBa);
  }

  public recordData(data: BufferAccess): void {
    this.recordByte(calculateChecksum8(data));
    this.oscillator.recordSeconds(fSyncMid, syncMidLength);
    recordBytes(this, data);
  }

  public end(): void {
    this.oscillator.recordSeconds(fSyncEnd, syncEndLength);
    this.oscillator.end();
  }

  public recordByte(byte: number): void {
    this.recordBit(0);
    recordByteLsbFirst(this, byte);
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fShort, 6);
      this.oscillator.recordOscillations(fLong, 6);
    } else {
      this.oscillator.recordOscillations(fShort, 12);
      this.oscillator.recordOscillations(fLong, 3);
    }
  }
}
