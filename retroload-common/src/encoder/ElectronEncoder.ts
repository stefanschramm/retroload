import {AbstractEncoder} from './AbstractEncoder.js';

const fBase = 1200;

/**
 * Encoder for Acorn Electron
 *
 * https://beebwiki.mdfs.net/Acorn_cassette_format
 */
export class ElectronEncoder extends AbstractEncoder {
  static override getTargetName() {
    return 'electron';
  }

  override begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordPilot(length: number) {
    this.recordCarrier(fBase * 2 * length);
  }

  override end() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordCarrier(oscillations: number) {
    // UEF Chunk &0111 - carrier tone
    this.recordOscillations(fBase * 2, oscillations);
  }

  recordGap(length: number) {
    // UEF Chunk &0112 - integer gap
    this.recordSilenceMs(1000 / (2 * length * fBase));
  }

  override recordByte(byte: number) {
    this.recordBit(0); // start bit
    super.recordByte(byte);
    this.recordBit(1); // stop bit
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fBase * 2, 2);
    } else {
      this.recordOscillations(fBase, 1);
    }
  }
}
