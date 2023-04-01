import {AbstractEncoder} from './AbstractEncoder.js';

const fBase = 1200;

/**
 * Encoder for Acorn Electron
 *
 * https://beebwiki.mdfs.net/Acorn_cassette_format
 */
export class ElectronEncoder extends AbstractEncoder {
  static getTargetName() {
    return 'electron';
  }

  begin() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  end() {
    this.recordSilence(this.recorder.sampleRate / 2);
  }

  recordCarrier(oscillations) {
    // UEF Chunk &0111 - carrier tone
    this.recordOscillations(fBase * 2, oscillations);
  }

  recordGap(length) {
    // UEF Chunk &0112 - integer gap
    this.recordSilenceMs(1000 / (2 * length * fBase));
  }

  recordByte(byte) {
    this.recordBit(0); // start bit
    super.recordByte(byte);
    this.recordBit(1); // stop bit
  }

  recordBit(value) {
    if (value) {
      this.recordOscillations(fBase * 2, 2);
    } else {
      this.recordOscillations(fBase, 1);
    }
  }
}
