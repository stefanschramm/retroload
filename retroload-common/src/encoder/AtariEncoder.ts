import {type BufferAccess} from '../BufferAccess.js';
import {Logger} from '../Logger.js';
import {AbstractEncoder} from './AbstractEncoder.js';

const fSpace = 3995;
const fMark = 5327;
const defaultBaudrate = 600;

/**
 * Encoder for Atari 800 (might work on Atari 400 as well)
 *
 * https://www.atariarchives.org/dere/chaptC.php
 */
export class AtariEncoder extends AbstractEncoder {
  static getTargetName() {
    return 'atari';
  }

  baudrate: number = defaultBaudrate;

  setDefaultBaudrate() {
    this.baudrate = defaultBaudrate;
  }

  setBaudrate(baudrate: number) {
    this.baudrate = baudrate;
  }

  recordIrg(length: number) {
    this.recordSeconds(fMark, length / 1000);
  }

  recordData(irgLength: number, data: BufferAccess) {
    Logger.debug('AtariEncoder - recordData');
    Logger.debug(data.asHexDump());
    this.recordIrg(irgLength);
    this.recordBytes(data);
  }

  recordByte(byte: number) {
    this.recordBit(0);
    this.recordByteLSBFirst(byte);
    this.recordBit(1);
  }

  recordBit(value: number) {
    if (value) {
      this.recordSeconds(fMark, 1 / this.baudrate);
    } else {
      this.recordSeconds(fSpace, 1 / this.baudrate);
    }
  }
}
