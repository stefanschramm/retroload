import {AbstractEncoder} from './AbstractEncoder.js';
import {ShortpilotOption, Option} from '../Options.js';

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

  static getOptions() {
    return [
      ShortpilotOption,
      new Option('msxfast', 'Fast baudrate', 'Use 2400 baud instead of 1200 (faster loading, less reliable)', {type: 'bool'}),
    ];
  }

  recordHeader(long: boolean) {
    this.recordSilence(this.recorder.sampleRate * (long ? secondsLongSilence : secondsShortSilence));
    long = this.options.shortpilot ? false : long; // use short pulse if shortpilot option is set
    const pulses = long ? pulsesLongHeader : pulsesShortHeader;
    this.recordOscillations(fOne * this.getBaudrateFactor(), pulses);
  }

  override recordByte(byte: number) {
    this.recordBit(0);
    super.recordByte(byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne * this.getBaudrateFactor(), 2);
    } else {
      this.recordOscillations(fZero * this.getBaudrateFactor(), 1);
    }
  }

  getBaudrateFactor() {
    return this.options.msxfast ? 2 : 1; // use 1200 or 2400 baud
  }
}