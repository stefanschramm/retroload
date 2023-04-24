import {AbstractEncoder} from './AbstractEncoder.js';
import {type FlagOptionDefinition, shortpilotOption} from '../Options.js';

const fZero = 1200;
const fOne = 2400;

const secondsShortSilence = 1.0;
const secondsLongSilence = 2.0;
const pulsesLongHeader = 16000;
const pulsesShortHeader = 4000;

const msxfastOption: FlagOptionDefinition = {
  name: 'msxfast',
  label: 'Fast baudrate',
  description: 'Use 2400 baud instead of 1200 (faster loading, less reliable)',
  type: 'bool',
  common: false,
};

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
      shortpilotOption,
      msxfastOption,
    ];
  }

  recordHeader(long: boolean) {
    this.recordSilence(this.recorder.sampleRate * (long ? secondsLongSilence : secondsShortSilence));
    long = this.options.isFlagSet(shortpilotOption) ? false : long; // use short pulse if shortpilot option is set
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
    return this.options.isFlagSet(msxfastOption) ? 2 : 1; // use 1200 or 2400 baud
  }
}
