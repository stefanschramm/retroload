import {type ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {calculateChecksum16Le} from '../../../common/Utils.js';

const fOne = 600;
const fZero = 1200;
const fPilot = fZero / 4;
const frameLength = 32;

/**
 * Encoder for the Polycomputer 880
 *
 * Poly-Computer 880 Bedienhandbuch, sections 7.2-7.4
 */
export class Poly880Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
    // Recording pilot (3.5 s)
    this.oscillator.recordOscillations(fPilot, fPilot * 3.5);
  }

  public recordData(data: BufferAccess): void {
    for (const frame of data.chunksPadded(frameLength)) {
      this.recordFrame(frame);
    }
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordByte(byte: number): void {
    recordByteLsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordHalfOscillation(fOne);
    } else {
      this.oscillator.recordOscillations(fZero, 1);
    }
  }

  private recordFrame(data: BufferAccess): void {
    const frameData = BufferAccess.create(36);
    // Header ("reserved"; currently just 16 0-bits)
    frameData.writeUint16Le(0x0000);
    frameData.writeBa(data);
    frameData.writeUint16Le(calculateChecksum16Le(frameData));

    // Frame pilot
    this.oscillator.recordOscillations(fPilot, 7);
    this.recordBit(1);
    this.recordBit(1);

    recordBytes(this, frameData);
  }
}
