import {BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8, hex8} from '../../../common/Utils.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {recordByteLsbFirst, recordBytes, type ByteRecorder} from '../ByteRecorder.js';
import {Oscillator} from '../Oscillator.js';

const fZero = 1950; // manual: 2400;
const fOne = 1050; // manual: 1200;
const fDelimiter = 557; // manual: 600;

/**
 * 1 byte block number + 128 data bytes.
 * In the recording a block will be of 130 bytes
 * (1 byte block number + 128 data bytes + 1 byte checksum).
 */
const blockSize = 128;
const oscillationsIntro = 400; // fast start for debugging; manual: 8000
const oscillationsBlockIntro = 200; // as in kcemu save_WAV.c; manual: 160

/**
 * Encoder for KC 85/1 (and similar) and KC 85/4 (and similar)
 */
export class KcEncoder implements ByteRecorder {
  private readonly oscillator: Oscillator;

  constructor(private readonly recorder: RecorderInterface) {
    this.oscillator = new Oscillator(recorder);
  }

  begin(): void {
    this.oscillator.begin();
    this.recordIntro();
  }

  end(): void {
    this.oscillator.end();
  }

  recordBlock(blockNumber: number, blockDataBa: BufferAccess): void {
    this.recorder.beginAnnotation(`Block ${hex8(blockNumber)}`);

    if (blockDataBa.length() > blockSize) {
      throw new InputDataError('Block data exceeds length of 128 bytes');
    }
    this.recordBlockIntro();
    this.recordDelimiter();

    const checksum = calculateChecksum8(blockDataBa);

    Logger.debug(`KcEncoder - recordBlock: blockNumber: ${hex8(blockNumber)}, checksum: ${hex8(checksum)}`);
    Logger.debug(blockDataBa.asHexDump());

    const blockBa = BufferAccess.create(1 + blockSize + 1);
    blockBa.writeUint8(blockNumber);
    blockBa.writeBa(blockDataBa);
    blockBa.setUint8(blockSize + 1, checksum);

    this.recordBytes(blockBa);

    this.recorder.endAnnotation();
  }

  recordIntro(): void {
    this.oscillator.recordOscillations(fOne, oscillationsIntro);
  }

  recordBlockIntro(appendSilence = false): void {
    this.oscillator.recordOscillations(fOne, oscillationsBlockIntro);
    if (appendSilence) {
      this.oscillator.recordSilenceMs(1500);
    }
  }

  recordDelimiter(): void {
    this.oscillator.recordOscillations(fDelimiter, 1);
  }

  recordBytes(bytes: BufferAccess): void {
    recordBytes(this, bytes);
  }

  recordByte(byte: number): void {
    recordByteLsbFirst(this, byte);
    this.recordDelimiter();
  }

  recordBit(value: number): void {
    if (value) {
      this.oscillator.recordOscillations(fOne, 1);
    } else {
      this.oscillator.recordOscillations(fZero, 1);
    }
  }
}
