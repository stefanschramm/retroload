import {type ByteRecorder, recordByteLsbFirst} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

const bitRate = 1200;
const frameLength = 32;

/**
 * Encoder for the Polycomputer 880
 *
 * Poly-Computer 880 Bedienhandbuch, sections 7.2-7.4
 */
export class Poly880Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;
  private sampleRemainder = 0;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
    this.recordPilot(3.5);
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
    this.recordHalfWave(1);
    if (value) {
      this.oscillator.togglePhase();
    }
    this.recordHalfWave(1);
  }

  private recordFrame(data: BufferAccess): void {
    this.recordPilot(7);
    this.recordBit(1);
    this.recordBit(1);

    for (let i = 0; i < 16; i += 1) {
      this.recordBit(0);
    }

    for (const byte of data.bytes()) {
      this.recordByte(byte);
    }

    let checksum = 0;
    for (let i = 0; i < data.length(); i += 2) {
      checksum = (checksum + data.getUint16Le(i)) & 0xffff;
    }
    this.recordByte(checksum & 0xff);
    this.recordByte(checksum >>> 8);
  }

  private recordPilot(cycles: number): void {
    for (let i = 0; i < cycles * 2; i += 1) {
      this.recordHalfWave(4);
    }
  }

  private recordHalfWave(halfBitCells: number): void {
    const exactSamples = (this.recorder.sampleRate * halfBitCells) / (bitRate * 2) + this.sampleRemainder;
    const samples = Math.floor(exactSamples);
    this.sampleRemainder = exactSamples - samples;
    this.oscillator.recordHalfOscillationSamples(samples);
  }
}
