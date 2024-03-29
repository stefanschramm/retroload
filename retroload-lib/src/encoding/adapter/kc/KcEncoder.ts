import {AbstractEncoder} from '../AbstractEncoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {calculateChecksum8, hex8} from '../../../common/Utils.js';

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
export class KcEncoder extends AbstractEncoder {
  override begin() {
    super.begin();
    this.recordIntro();
  }

  recordBlock(blockNumber: number, blockDataBa: BufferAccess) {
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

  recordIntro() {
    this.recordOscillations(fOne, oscillationsIntro);
  }

  recordBlockIntro(appendSilence = false) {
    this.recordOscillations(fOne, oscillationsBlockIntro);
    if (appendSilence) {
      this.recordSilenceMs(1500);
    }
  }

  recordDelimiter() {
    this.recordOscillations(fDelimiter, 1);
  }

  override recordByte(byte: number) {
    super.recordByte(byte);
    this.recordDelimiter();
  }

  recordBit(value: number) {
    if (value) {
      this.recordOscillations(fOne, 1);
    } else {
      this.recordOscillations(fZero, 1);
    }
  }
}
