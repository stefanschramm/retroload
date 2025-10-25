import {type ByteRecorder, recordByteMsbFirst, recordBytes} from '../ByteRecorder.js';
import {calculateChecksum8Xor, hex8} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {Oscillator} from '../Oscillator.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

const syncIntroLength = 10; // s
const syncIntroLengthShort = 5; // s
const fSync = 770;

/**
 * Encoder for Apple II
 *
 * http://www.applevault.com/hardware/apple/apple2/apple2cassette.html
 *
 * Example - loading of 8 bytes using the monitor:
 * 0800.0808R
 */
export class Apple2Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(
    recorder: RecorderInterface,
    private readonly shortpilot: boolean,
  ) {
    this.oscillator = new Oscillator(recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordData(data: BufferAccess): void {
    this.recordSync();
    this.recordSyncBit();
    recordBytes(this, data);
    const checksum = calculateChecksum8Xor(data, 0xff);
    Logger.debug(data.asHexDump());
    Logger.debug(`Checksum: ${hex8(checksum)}`);
    this.recordByte(checksum);

    // hack to finish reading
    this.oscillator.recordSeconds(fSync, 0.25);
  }

  private recordSync(): void {
    this.oscillator.recordSeconds(fSync, this.shortpilot ? syncIntroLengthShort : syncIntroLength);
  }

  private recordSyncBit(): void {
    this.oscillator.recordHalfOscillation(2500);
    this.oscillator.recordHalfOscillation(2000);
  }

  public recordByte(byte: number): void {
    recordByteMsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    this.oscillator.recordOscillations(value ? 1000 : 2000, 1);
  }
}
