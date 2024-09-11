import {BufferAccess} from '../../../common/BufferAccess.js';
import {type ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {Oscillator} from '../Oscillator.js';

const fZero = 1200;
const fOne = 2400;
export const maxFileNameLength = 6;

/**
 * Encoder for TA alphatronic PC
 *
 * TA alphatronic PC Service-Handbuch, p. 58
 * https://oldcomputers-ddns.org/public/pub/rechner/ta/alphatronic_pc-8/manual/ta_pc8_service_handbuch_(bw_ocr).pdf
 */
export class TaEncoder implements ByteRecorder {
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

  public recordFile(filename: string, dataBa: BufferAccess): void {
    const headerBa = BufferAccess.create(16);
    headerBa.writeAsciiString('', 10, 0xd3);
    headerBa.writeAsciiString(filename, maxFileNameLength, 0);

    this.recorder.beginAnnotation('Header');
    this.oscillator.recordOscillations(fOne, 500);
    recordBytes(this, headerBa);
    this.recorder.endAnnotation();
    this.recorder.beginAnnotation('Data');
    this.oscillator.recordOscillations(fOne, 500);
    recordBytes(this, dataBa);
    this.oscillator.recordOscillations(fOne, 500);
    this.recorder.endAnnotation();
  }

  public recordByte(byte: number): void {
    this.recordBit(0); // start bit
    recordByteLsbFirst(this, byte);
    this.recordBit(1); // stop bits
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fOne, 2);
    } else {
      this.oscillator.recordOscillations(fZero, 1);
    }
  }
}
