import {type ByteRecorder, recordByteMsbFirst, recordBytes} from '../ByteRecorder.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

const fZero = 600;
const fOne = 1200;

/**
 * Encoder for Thomson MO5
 *
 * http://pulko.mandy.pagesperso-orange.fr/shinra/mo5_hard.shtml
 * SAVEMA MO5 Documentation technique - MO5 Lecteuer-enregistreur de programmes / Programmrekorder / Program Recorder
 * http://dcmoto.free.fr/documentation/moniteur-mo5-casst/moniteur-mo5-casst_src.txt
 */
export class Mo5Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordStartBlock(ba: BufferAccess): void {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('Start block');
    this.recordPilot(1);
    recordBytes(this, ba);
    this.recordPilot(2);
    this.recorder.endAnnotation();
  }

  public recordDataBlock(ba: BufferAccess): void {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('Data block');
    this.recordPilot(0.2);
    recordBytes(this, ba);
    this.recorder.endAnnotation();
  }

  public recordEndBlock(ba: BufferAccess): void {
    Logger.debug(ba.asHexDump());
    this.recorder.beginAnnotation('End block');
    recordBytes(this, ba);
    this.recordPilot(1.5);
    this.recorder.endAnnotation();
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  /**
   * @param length length in seconds
   */
  public recordPilot(length: number): void {
    this.oscillator.recordOscillations(fZero, length * fZero);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordHalfOscillation(fOne);
      this.oscillator.recordHalfOscillation(fOne);
    } else {
      this.oscillator.recordHalfOscillation(fZero);
    }
  }
}
