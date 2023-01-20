import {BaseEncoder} from './base.js';

const fSpace = 3995;
const fMark = 5327;

/**
 * Encoder for Atari 800 (might work on Atari 400 as well)
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
    this.recordSeconds(fMark, irgLength / 1000);
    this.recordBytes(data);
  }

  recordByte(byte) {
    this.recordBit(0);
    this.recordByteLSBFirst(byte);
    this.recordBit(1);
  }

  recordBit(value) {
    if (value) {
      this.recordSeconds(fMark, 1 / this.baudrate);
    } else {
      this.recordSeconds(fSpace, 1 / this.baudrate);
    }
  }
}
