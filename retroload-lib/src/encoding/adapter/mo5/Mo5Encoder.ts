import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {AbstractEncoder} from '../AbstractEncoder.js';

const fZero = 600;
const fOne = 1200;

/**
 * Encoder for Thomson MO5
 *
 * http://pulko.mandy.pagesperso-orange.fr/shinra/mo5_hard.shtml
 * SAVEMA MO5 Documentation technique - MO5 Lecteuer-enregistreur de programmes / Programmrekorder / Program Recorder
 * http://dcmoto.free.fr/documentation/moniteur-mo5-casst/moniteur-mo5-casst_src.txt
 */
export class Mo5Encoder extends AbstractEncoder {
  recordStartBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('Start block');
    this.recordPilot(1);
    this.recordBytes(ba);
    this.recordPilot(2);
    this.recorder.endAnnotation();
  }

  recordDataBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('Data block');
    this.recordPilot(0.2);
    this.recordBytes(ba);
    this.recorder.endAnnotation();
  }

  recordEndBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('End block');
    this.recordBytes(ba);
    this.recordPilot(1.5);
    this.recorder.endAnnotation();
  }

  override recordByte(byte: number) {
    this.recordByteMsbFirst(byte);
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
