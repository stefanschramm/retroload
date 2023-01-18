import {BaseEncoder} from './base.js';

const fSpace = 3995;
const fMark = 5327;

/**
 * Work in progress
 *
 * https://www.atariarchives.org/dere/chaptC.php
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'atari';
  }

  setDefaultBaudrate() {
    this.baudrate = 600;
  }

  setBaudrate(baudrate) {
    this.baudrate = baudrate;
  }

  recordData(irgLength, data) {
    console.log(this.recorder.sampleRate);
    this.recordSeconds(fMark, irgLength / 1000);
    this.recordBytes(data);
  }

  recordByte(byte) {
    this.recordBit(0);
    this.recordByteLSBFirst(byte);
    this.recordBit(1);
  }

  recordBit(value) {
    // TODO: Probably the harmonics of the square waves are causing problems here. Try so switch to sine? - Requires change in recording classes and might break working examples.
    if (value) {
      this.recordSeconds(fMark, 1 / this.baudrate);
    } else {
      this.recordSeconds(fSpace, 1 / this.baudrate);
    }
  }
}
