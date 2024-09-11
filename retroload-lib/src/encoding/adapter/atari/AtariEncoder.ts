import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {recordByteLsbFirst, recordBytes, type ByteRecorder} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';

const fSpace = 3995;
const fMark = 5327;
const defaultBaudrate = 600;

/**
 * Encoder for Atari 800 (might work on Atari 400 as well)
 *
 * https://www.atariarchives.org/dere/chaptC.php
 */
export class AtariEncoder implements ByteRecorder {
  private baudrate: number = defaultBaudrate;

  private readonly oscillator: Oscillator;

  public constructor(recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public setDefaultBaudrate(): void {
    this.baudrate = defaultBaudrate;
  }

  public setBaudrate(baudrate: number): void {
    this.baudrate = baudrate;
  }

  public recordIrg(length: number): void {
    this.oscillator.recordSeconds(fMark, length / 1000);
  }

  public recordData(irgLength: number, data: BufferAccess): void {
    Logger.debug('AtariEncoder - recordData');
    Logger.debug(data.asHexDump());
    this.recordIrg(irgLength);
    this.recordBytes(data);
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  public recordByte(byte: number): void {
    this.recordBit(0);
    recordByteLsbFirst(this, byte);
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordSeconds(fMark, 1 / this.baudrate);
    } else {
      this.oscillator.recordSeconds(fSpace, 1 / this.baudrate);
    }
  }
}
