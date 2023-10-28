import {AbstractEncoder} from './AbstractEncoder.js';

// const fBase = 1200;

/**
 * Encoder for Acorn Electron
 *
 * https://beebwiki.mdfs.net/Acorn_cassette_format
 */
export class ElectronEncoder extends AbstractEncoder {
  static override getTargetName() {
    return 'electron';
  }

  private fBase = 1200;

  override begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordPilot(length: number) {
    this.recordCarrier(this.fBase * 2 * length);
  }

  override end() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordCarrier(oscillations: number) {
    // UEF Chunk &0111 - carrier tone
    this.recordOscillations(this.fBase * 2, oscillations);
  }

  recordGap(length: number) {
    // UEF Chunk &0112 - integer gap
    this.recordSilenceMs(1000 / (2 * length * this.fBase));
  }

  override recordByte(byte: number, dataBits = 8, parity: ParitySetting = 'N', stopBits = 1) {
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

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(this.fBase * 2, 2);
    } else {
      this.recordOscillations(this.fBase, 1);
    }
  }

  setBaseFrequency(f: number) {
    this.fBase = f;
  }
}

export type ParitySetting = 'N' | 'E' | 'O';
