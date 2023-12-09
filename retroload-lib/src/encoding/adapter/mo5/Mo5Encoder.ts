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
  static override getTargetName() {
    return 'mo5';
  }

  public override begin(): void {
    this.recordSilence(this.recorder.sampleRate); // TODO: shorten
  }

  recordStartBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recordPilot(1);
    this.recordBytes(ba);
    this.recordPilot(2);
  }

  recordDataBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recordPilot(0.2);
    this.recordBytes(ba);
  }

  recordEndBlock(ba: BufferAccess) {
    Logger.debug(ba.asHexDump());
    this.recordBytes(ba);
    this.recordPilot(1.5);
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
