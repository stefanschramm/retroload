import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {recordBytes, type ByteRecorder} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';

// const fBase = 1200;

/**
 * Encoder for Acorn Electron
 *
 * https://beebwiki.mdfs.net/Acorn_cassette_format
 */
export class ElectronEncoder implements ByteRecorder {
  private fBase = 1200;
  private readonly oscillator: Oscillator;

  constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  public recordPilot(length: number): void {
    this.recordCarrier(this.fBase * 2 * length);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.recordSilence(this.recorder.sampleRate / 2);
  }

  public recordSilenceMs(lengthMs: number): void {
    this.oscillator.recordSilenceMs(lengthMs);
  }

  public recordCarrier(oscillations: number): void {
    // UEF Chunk &0111 - carrier tone
    this.oscillator.recordOscillations(this.fBase * 2, oscillations);
  }

  public recordGap(length: number): void {
    // UEF Chunk &0112 - integer gap
    this.oscillator.recordSilenceMs(1000 / (2 * length * this.fBase));
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  public recordByte(byte: number, dataBits = 8, parity: ParitySetting = 'N', stopBits = 1): void {
    this.recordBit(0); // start bit

    // LSB first
    let sum = 0;
    for (let i = 0; i < dataBits; i += 1) {
      const bit = ((byte & (1 << i)) === 0) ? 0 : 1;
      sum += bit;
      this.recordBit(bit);
    }

    // TODO: not sure, if parity, stopBits and dataBits is working correctly
    if (parity === 'E') {
      this.recordBit((sum % 2 === 0) ? 1 : 0);
    } else if (parity === 'O') {
      this.recordBit((sum % 2 === 0) ? 0 : 1);
    }

    // stop bits
    for (let i = 0; i < stopBits; i++) {
      this.recordBit(1);
    }
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(this.fBase * 2, 2);
    } else {
      this.oscillator.recordOscillations(this.fBase, 1);
    }
  }

  public setBaseFrequency(f: number): void {
    this.fBase = f;
  }
}

export type ParitySetting = 'N' | 'E' | 'O';
