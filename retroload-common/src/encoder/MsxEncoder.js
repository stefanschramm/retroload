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
 * https://github.com/joyrex2001/castools/blob/master/cas2wav.c
 */
export class MsxEncoder extends AbstractEncoder {
  static getTargetName() {
    return 'msx';
  }

  static getOptions() {
    return [
      ShortpilotOption,
      new Option('msxfast', 'Fast baudrate', 'Use 2400 baud instead of 1200 (faster loading, less reliable)'),
    ];
  }

  recordHeader(long) {
    this.recordSilence(this.recorder.sampleRate * (long ? secondsLongSilence : secondsShortSilence));
    long = this.options.shortpilot ? false : long; // use short pulse if shortpilot option is set
    const pulses = long ? pulsesLongHeader : pulsesShortHeader;
    this.recordOscillations(fOne * this.getBaudrateFactor(), pulses);
  }

  recordByte(byte) {
    this.recordBit(0);
    super.recordByte(byte);
    this.recordBit(1);
    this.recordBit(1);
  }

  recordBit(value) {
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
