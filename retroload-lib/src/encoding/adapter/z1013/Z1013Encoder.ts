import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {hex16} from '../../../common/Utils.js';
import {type ByteRecorder, recordByteLsbFirst, recordBytes} from '../ByteRecorder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {Oscillator} from '../Oscillator.js';

const blockDataSize = 32;
const fOne = 1280;
const fZero = 2560;
const fSync = 640;

/**
 * Encoder for Robotron Z 1013
 *
 * https://hc-ddr.hucki.net/wiki/doku.php/z1013/kassettenformate
 */
export class Z1013Encoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  public constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(this.recorder);
  }

  public begin(): void {
    this.oscillator.begin();
    this.recordFirstIntro();
  }

  public end(): void {
    this.oscillator.end();
  }

  public recordData(ba: BufferAccess): void {
    let i = 0;
    for (const blockBa of ba.chunks(blockDataSize)) {
      this.recordBlock(i++, blockBa);
    }
  }

  /**
   * Instead of incrementing the block number by 1 for each block,
   * Headersave uses the load address for each block as block number.
   */
  public recordHeadersaveData(ba: BufferAccess, initialBlockNumber: number): void {
    let i = initialBlockNumber;
    for (const blockBa of ba.chunks(blockDataSize)) {
      this.recordBlock(i, blockBa);
      i += blockDataSize;
    }
  }

  public recordBlock(blockNumber: number, blockDataBa: BufferAccess): void {
    this.recorder.beginAnnotation(`Block ${hex16(blockNumber)}`);

    const blockBa = BufferAccess.create(2 + blockDataBa.length() + 2);
    blockBa.writeUint16Le(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.writeUint16Le(calculateChecksum(blockBa.slice(0, blockBa.length() - 2)));

    Logger.debug(blockBa.asHexDump());

    this.recordIntro();
    this.recordDelimiter();
    recordBytes(this, blockBa);

    this.recorder.endAnnotation();
  }

  public recordFirstIntro(): void {
    this.recorder.beginAnnotation('Sync');
    this.oscillator.recordOscillations(fSync, 2000);
    this.recorder.endAnnotation();
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

  private recordIntro(): void {
    this.oscillator.recordOscillations(fSync, 7);
  }

  private recordDelimiter(): void {
    this.oscillator.recordOscillations(fOne, 1);
  }
}

function calculateChecksum(ba: BufferAccess): number {
  let checkSum = 0;
  for (let i = 0; i < ba.length(); i += 2) {
    const word = ba.getUint16Le(i);
    checkSum = (checkSum + word) & 0xffff;
  }

  return checkSum;
}
