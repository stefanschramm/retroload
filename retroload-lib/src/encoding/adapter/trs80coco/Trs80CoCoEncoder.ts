import {ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {Oscillator} from '../Oscillator.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';
import {calculateChecksum8} from '../../../common/Utils.js';

export const MAX_NAME_LENGTH = 8;

// const FILE_TYPE_BASIC = 0x00;
// const FILE_TYPE_DATA = 0x01;
export const FILE_TYPE_MACHINE_LANGUAGE = 0x02;

const BLOCK_TYPE_NAMEFILE = 0x00;
const BLOCK_TYPE_DATA = 0x01;
const BLOCK_TYPE_END_OF_FILE = 0xff;

const MAX_BLOCK_SIZE = 0xff;

/**
 * http://www.colorcomputerarchive.com/coco/Documents/Manuals/Hardware/Color%20Computer%20Technical%20Reference%20Manual%20(Tandy).pdf - p. 39
 * https://colorcomputerarchive.com/repo/Documents/Manuals/Hardware/Color%20Computer%203%20Service%20Manual%20(Tandy).pdf - p. 47
 */
export class Trs80CoCoEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin(): void {
    this.oscillator.begin();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordData(
    ba: BufferAccess,
    fileName: string,
    fileType: number,
    startAddress: number = 0x0000,
    loadAddress: number = 0x0000,
  ): void {

    this.recordSync();

    const nameFileBlockData = BufferAccess.create(15);
    nameFileBlockData.writeAsciiString(fileName, MAX_NAME_LENGTH, 0x20);
    nameFileBlockData.writeUint8(fileType);
    nameFileBlockData.writeUint8(0x00); // 0x00 = binary; 0xff = ascii
    nameFileBlockData.writeUint8(0x00); // 0x01 = continuous; 0xff = gaps ?
    nameFileBlockData.writeUint16Be(startAddress);
    nameFileBlockData.writeUint16Be(loadAddress);

    this.recordBlock(BLOCK_TYPE_NAMEFILE, nameFileBlockData);

    this.oscillator.recordSilenceMs(500);

    this.recordSync();

    for (const chunk of ba.chunks(MAX_BLOCK_SIZE)) {
      this.recordBlock(BLOCK_TYPE_DATA, chunk);
    }

    this.recordBlock(BLOCK_TYPE_END_OF_FILE, BufferAccess.create(0));
  }

  private recordSync(): void {
    for (let i = 0; i < 128; i++) {
      this.recordByte(0x55);
    }
  }

  private recordBlock(type: number, data: BufferAccess): void {
    const checkedData = BufferAccess.create(2 + data.length());
    checkedData.writeUint8(type);
    checkedData.writeUint8(data.length());
    checkedData.writeBa(data);
    Logger.debug(checkedData.asHexDump());

    this.recordByte(0x55); // leader byte
    this.recordByte(0x3c); // sync byte
    recordBytes(this, checkedData);
    this.recordByte(calculateChecksum8(checkedData));
    this.recordByte(0x55); // leader byte
  }

  public recordByte(byte: number): void {
    recordByteLsbFirst(this, byte);
  }

  public recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(2400, 1);
    } else {
      this.oscillator.recordOscillations(1200, 1);
    }
  }
}
