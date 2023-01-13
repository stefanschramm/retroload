import {BaseEncoder} from './base.js';
import {dumpDv} from '../utils.js';

/**
 * Work in progress
 *
 * https://www.atariarchives.org/dere/chaptC.php
 */
export class Encoder extends BaseEncoder {
  static getTargetName() {
    return 'atari';
  }

  recordData(baudrate, irgLength, data) {
    dumpDv(data);
    // TODO: baudrate + irgLength
    for (let i = 0; i < 1000; i++) {
      this.recordByte(0x55);
    }
    this.recordBytes(data);
    for (let i = 0; i < 100; i++) {
      this.recordByte(0x55);
    }
  }

  recordByte(byte) {
    this.recordBit(0);
    this.recordByteLSBFirst(byte);
    this.recordBit(1);
  }

  recordBit(value) {
    if (value) {
      this.recordHalfOscillation(5327);
    } else {
      this.recordHalfOscillation(3995);
    }
  }
}
