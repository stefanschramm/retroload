import {AbstractAdapter} from './adapter.js';
import {Encoder} from '../encoder/kc.js';

export function getName() {
  return 'KC .SSS-File';
}

export function getInternalName() {
  return 'kcsss';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.sss$/i) !== null,
    header: undefined, // no specific header
  };
}

export function getAdapters() {
  return [Adapter];
}

const headerSize = 3 + 8; // basic header + filename
const blockSize = 128;

export class Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static getOptions() {
    return [];
    /*
    TODO
    return {
      fileName: {
        label: 'File name',
        formatDescription: 'Must consist of up to 8 letters or numbers.',
        validate: function(value) {
          return value.match(/^[a-zA-Z0-9]{0,8}$/);
        },
        defaultValue: function(filename, data) {
          return filename.split('.')[0].replace(/[^A-Za-z0-9]/g, '').substring(0, 8);
        },
      },
    };
    */
  }

  static encode(recorder, ba, options) {
    const firstBlock = new Uint8Array([
      ...[0xd3, 0xd3, 0xd3], // basic header
      ...(new TextEncoder()).encode('TEST    '), // filename - TODO: from option
      ...(ba.referencedSlice(0, blockSize - headerSize).asUint8ArrayCopy()), // first block data
    ]);

    const remainingBlocks = Math.ceil((ba.length() + headerSize) / blockSize) - 1;

    // TODO: Possible warnings when:
    // - more than 255 blocks

    const e = new Encoder(recorder);

    e.begin();
    e.recordBlock(1, new BufferAccess(firstBlock.buffer));
    for (let i = 0; i < remainingBlocks; i++) {
      const fileOffset = (blockSize - headerSize) + i * blockSize;
      const blockDataLength = (fileOffset + blockSize <= ba.length()) ? blockSize : ba.length() - fileOffset;
      const blockData = ba.slice(fileOffset, blockDataLength);
      const blockNumber = i + 2;
      e.recordBlock(blockNumber, blockData);
    }
    e.end();
  }
}
