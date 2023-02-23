import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/kc.js';
import {BufferAccess} from '../buffer_access.js';
import {NameOption} from '../option.js';
import {InvalidArgumentError} from '../exception.js';

const headerSize = 3 + 8; // basic header + filename
const blockSize = 128;
const maxFileNameLength = 8;

export class KcSssAdapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getName() {
    return 'KC .SSS-File';
  }

  static getInternalName() {
    return 'kcsss';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.sss$/i) !== null,
      header: undefined, // no specific header
    };
  }

  static getOptions() {
    return [
      NameOption,
    ];
  }

  /**
   * @param {WavRecorder|PcmRecorder} recorder
   * @param {BufferAccess} ba
   * @param {object} options
   */
  static encode(recorder, ba, options) {
    // Note: The file name is case-sensitive (there is a difference between CLOAD "EXAMPLE" and CLOAD "example").
    const filename = options.name !== undefined ? options.name : '';
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    // Usually, .SSS files are a multiple of 128. But for now we're not enforcing it because the blocks will get padded by the Encoder's recordBlock function.

    const firstBlockBa = BufferAccess.create(128);
    firstBlockBa.writeUInt8(0xd3);
    firstBlockBa.writeUInt8(0xd3);
    firstBlockBa.writeUInt8(0xd3);
    firstBlockBa.writeAsciiString(filename, maxFileNameLength, 0x20);
    firstBlockBa.writeBa(ba.slice(0, blockSize - headerSize));

    const remainingDataBa = ba.slice(blockSize - headerSize);
    const remainingBlocks = Math.ceil(remainingDataBa.length() / blockSize);

    const e = new Encoder(recorder);

    e.begin();
    e.recordBlock(1, firstBlockBa);
    for (let i = 0; i < remainingBlocks; i++) {
      const blockNumber = i + 2;
      const remainingBytes = remainingDataBa.length() - i * blockSize;
      const blockDataBa = remainingDataBa.slice(i * blockSize, Math.min(blockSize, remainingBytes));
      const isLastBlock = i === remainingBlocks - 1;
      e.recordBlock(isLastBlock ? 0xff : blockNumber, blockDataBa);
      // In some implementations the last block is blockNumber and in others 0xff. Not sure which is more correct.
    }
    e.recordDelimiter(); // it looks like this is needed for programs <= 2 blocks? (tested in jkcemu)
    e.end();
  }
}
