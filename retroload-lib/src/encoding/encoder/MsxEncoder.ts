import {AbstractEncoder} from './AbstractEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

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
export class MsxEncoder extends AbstractEncoder {
  static override getTargetName() {
    return 'msx';
  }

  private readonly baudrateFactor: number;

  constructor(
    recorder: RecorderInterface,
    private readonly shortpilot = false,
    fast = false,
  ) {
    super(recorder);
    this.baudrateFactor = fast ? 2 : 1; // use 1200 or 2400 baud
  }

  recordHeader(long: boolean) {
    this.recordSilence(this.recorder.sampleRate * (long ? secondsLongSilence : secondsShortSilence));
    long = this.shortpilot ? false : long; // use short pulse if shortpilot option is set
    const pulses = long ? pulsesLongHeader : pulsesShortHeader;
    this.recordOscillations(fOne * this.baudrateFactor, pulses);
  }

  override recordByte(byte: number) {
    this.recordBit(0);
    super.recordByte(byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne * this.baudrateFactor, 2);
    } else {
      this.recordOscillations(fZero * this.baudrateFactor, 1);
    }
  }
}
