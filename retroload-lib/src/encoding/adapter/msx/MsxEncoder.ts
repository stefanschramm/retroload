import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {Oscillator} from '../Oscillator.js';
import {type ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';

const fZero = 1200;
const fOne = 2400;

const secondsShortSilence = 1.0;
const secondsLongSilence = 2.0;
const pulsesLongHeader = 16000;
const pulsesShortHeader = 4000;

/**
 * Encoder for MSX
 *
 * https://www.msx.org/forum/semi-msx-talk/emulation/how-do-exactly-works-cas-format
 * MSX Technical Data Book, p. 172 - 175
 */
export class MsxEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;
  private readonly baudrateFactor: number;

  public constructor(
    private readonly recorder: RecorderInterface,
    private readonly shortpilot = false,
    fast = false,
  ) {
    this.baudrateFactor = fast ? 2 : 1; // use 1200 or 2400 baud
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordHeader(long: boolean): void {
    this.oscillator.recordSilence(this.recorder.sampleRate * (long ? secondsLongSilence : secondsShortSilence));
    long = this.shortpilot ? false : long; // use short pulse if shortpilot option is set
    const pulses = long ? pulsesLongHeader : pulsesShortHeader;
    this.oscillator.recordOscillations(fOne * this.baudrateFactor, pulses);
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  public recordByte(byte: number): void {
    this.recordBit(0);
    recordByteLsbFirst(this, byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fOne * this.baudrateFactor, 2);
    } else {
      this.oscillator.recordOscillations(fZero * this.baudrateFactor, 1);
    }
  }
}
