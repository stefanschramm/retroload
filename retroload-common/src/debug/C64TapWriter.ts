import {C64Encoder} from '../encoder/C64Encoder.js';
import * as fs from 'fs';

/**
 * Used for debugging to convert .prg files to .tap for testing in emulator
 */
export class C64TapWriter extends C64Encoder {
  pulses: number[] = [];
  begin() {
    this.pulses = [];
    super.begin();
  }

  recordPulse(value) {
    super.recordPulse(value);
    this.pulses.push(value / 8);
  }

  end() {
    super.end();

    const lengthBuffer = new ArrayBuffer(4);
    (new DataView(lengthBuffer)).setUint32(0, this.pulses.length, true);

    const tapBuffer = Uint8Array.from([
      ...(new TextEncoder()).encode('C64-TAPE-RAW'),
      ...[0x01], // version
      ...[0x00, 0x00, 0x00], // unused
      ...new Uint8Array(lengthBuffer), // file data size
      ...[0x00, 0x00, 0x00, 0x00], // not documented??
      ...this.pulses,
    ]);
    fs.writeFileSync('/tmp/test.tap', tapBuffer);
  }
}
