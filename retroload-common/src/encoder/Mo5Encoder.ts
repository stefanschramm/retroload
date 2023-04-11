import {type BufferAccess} from '../BufferAccess.js';
import {AbstractEncoder} from './AbstractEncoder.js';

const fZero = 600;
const fOne = 1200;

/**
 * Encoder for Thomson MO5
 *
 * http://pulko.mandy.pagesperso-orange.fr/shinra/mo5_hard.shtml
 * SAVEMA MO5 Documentation technique - MO5 Lecteuer-enregistreur de programmes / Programmrekorder / Program Recorder
 */
export class Mo5Encoder extends AbstractEncoder {
  static override getTargetName() {
    return 'mo5';
  }

  recordStartBlock(ba: BufferAccess) {
    this.recordPilot(1);
    this.recordBytes(ba);
    this.recordPilot(2);
  }

  recordDataBlock(ba: BufferAccess) {
    this.recordPilot(0.2);
    this.recordBytes(ba);
  }

  recordEndBlock(ba: BufferAccess) {
    this.recordBytes(ba);
    this.recordPilot(1.5);
  }

  override recordByte(byte: number) {
    this.recordByteMSBFirst(byte);
  }

  /**
   * @param length length in seconds
   */
  recordPilot(length: number) {
    this.recordOscillations(fZero, length * fZero);
  }

  recordBit(value: number) {
    if (value) {
      this.recordHalfOscillation(fOne);
      this.recordHalfOscillation(fOne);
    } else {
      this.recordHalfOscillation(fZero);
    }
  }
}
