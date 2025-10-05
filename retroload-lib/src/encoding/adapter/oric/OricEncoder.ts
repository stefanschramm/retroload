import {ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {Oscillator} from '../Oscillator.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';
import {parity8Bit} from '../../../common/Utils.js';

const fShort = 2400.0;
// const fMedium = 1600.0;
const fLong = 1200.0;
export const syncByte = 0x16;
export const syncEndByte = 0x24;

/**
 * https://wiki.defence-force.org/doku.php?id=oric:hardware:tape_encoding
 * http://oric.free.fr/programming.html
 * https://blog.defence-force.org/index.php?page=articles&ref=ART63
 */
export class OricEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(
    private readonly recorder: RecorderInterface,
    private readonly shortpilot = false,
  ) {
    this.oscillator = new Oscillator(this.recorder);
  }
  
  public begin(): void {
    this.oscillator.begin();
    // Polarity seems to be relevant - first half oscillation is expected to be low
    this.oscillator.togglePhase();
    this.recordSync();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordHeader(
    type: number,
    autostart: number,
    name: string,
    loadAddress: number,
    endAddress: number,
  ): void {
    const headerBa = BufferAccess.create(9 + name.length + 1);
    headerBa.writeUint8(0); // unused
    headerBa.writeUint8(0); // unused
    headerBa.writeUint8(type);
    headerBa.writeUint8(autostart);
    headerBa.writeUint16Be(endAddress);
    headerBa.writeUint16Be(loadAddress);
    headerBa.writeUint8(0); // unused
    headerBa.writeAsciiString(name);
    headerBa.writeUint8(0); // end of string

    Logger.debug(headerBa.asHexDump());

    this.recordBytes(headerBa);
  }

  public recordBytes(data: BufferAccess): void {
    recordBytes(this, data);
  }

  private recordSync(): void {
    const syncByteCount = this.shortpilot ? 64 : 512;
    for (let i = 0; i < syncByteCount; i++) {
      this.recordByte(syncByte);
    }
    this.recordByte(syncEndByte);
  }

  public recordByte(byte: number): void {
    this.recordBit(0);
    recordByteLsbFirst(this, byte);
    this.recordBit(parity8Bit(byte));
    this.recordBit(1); // at least 3 stop bits
    this.recordBit(1);
    this.recordBit(1);
    this.recordBit(1);
  }

  public recordBit(value: number): void {
    // fast encoding scheme
    if (value) {
      this.oscillator.recordOscillations(fShort, 1);
    } else {
      this.oscillator.recordHalfOscillation(fShort);
      this.oscillator.recordHalfOscillation(fLong);        
    }
  }
}

