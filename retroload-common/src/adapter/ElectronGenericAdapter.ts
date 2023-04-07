import {NameOption, LoadOption, EntryOption, ShortpilotOption, type OptionValues} from '../Options.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';
import {ElectronEncoder} from '../encoder/ElectronEncoder.js';
import {Logger} from '../Logger.js';
import {BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const maxFileNameLength = 10;
const maxBlockSize = 256;

export class ElectronGenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return ElectronEncoder.getTargetName();
  }

  static getName() {
    return 'Acorn Electron (Generic data)';
  }

  static getOptions() {
    return [
      NameOption, // 1 - 10 characters
      LoadOption,
      EntryOption,
      ShortpilotOption,
    ];
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const filename = options.name !== undefined ? (options.name as string) : '';
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const load = parseInt(options.load !== undefined ? (options.load as string) : '0000', 16);
    if (isNaN(load) || load < 0 || load > 0xffff) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const entry = parseInt(options.entry !== undefined ? (options.entry as string) : '0000', 16);
    if (isNaN(entry) || entry < 0 || entry > 0xffff) {
      throw new InvalidArgumentError('entry', 'Option entry is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    const blocks = Math.ceil(ba.length() / maxBlockSize);

    const e = new ElectronEncoder(recorder, options);
    e.begin();

    for (let block = 0; block < blocks; block++) {
      const isFirstBlock = block === 0;
      const isLastBlock = block === blocks - 1;
      const remainingBytes = ba.length() - block * maxBlockSize;
      const blockDataBa = ba.slice(block * maxBlockSize, Math.min(maxBlockSize, remainingBytes));

      const blockHeaderBa = BufferAccess.create(filename.length + 18);
      blockHeaderBa.writeAsciiString(filename);
      blockHeaderBa.writeUInt8(0);
      blockHeaderBa.writeUInt32LE(load | 0xffff0000); // TODO: why 32 bits?
      blockHeaderBa.writeUInt32LE(entry | 0xffff0000); // TODO: why 32 bits?
      blockHeaderBa.writeUInt16LE(block);
      blockHeaderBa.writeUInt16LE(blockDataBa.length());
      blockHeaderBa.writeUInt8(isLastBlock ? 0x80 : 0x00);
      blockHeaderBa.writeUInt32LE(0xffffffff); // TODO: address of next file?

      const blockSize = 1 + blockHeaderBa.length() + 2 + blockDataBa.length() + (blockDataBa.length() > 0 ? 2 : 0);
      const blockBa = BufferAccess.create(blockSize);
      blockBa.writeUInt8(0x2a); // sync byte
      blockBa.writeBa(blockHeaderBa);
      blockBa.writeUInt16BE(calculateCrc(blockHeaderBa));
      blockBa.writeBa(blockDataBa);
      blockBa.writeUInt16BE(calculateCrc(blockDataBa));

      Logger.debug(`Block 0x${block.toString(16).padStart(2, '0')}`);
      Logger.debug(blockBa.asHexDump());

      e.recordPilot(isFirstBlock ? (options.shortpilot ? 1.5 : 5.1) : 0.9);
      e.recordBytes(blockBa);
    }

    e.recordPilot(options.shortpilot ? 1.5 : 5.3);
    e.end();
  }
}

/**
 * https://stackoverflow.com/a/75806068
 */
function calculateCrc(ba: BufferAccess): number {
  let crc = 0;
  for (let i = 0, t = 0; i < ba.length(); i++, crc &= 0xffff) {
    t = (crc >> 8) ^ ba.getUint8(i);
    t ^= t >> 4;
    crc = (crc << 8) ^ (t << 12) ^ (t << 5) ^ t;
  }
  return crc;
}
