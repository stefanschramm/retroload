import {nameOption, loadOption, entryOption, shortpilotOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';
import {ElectronEncoder} from '../encoder/ElectronEncoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const maxFileNameLength = 10;
const maxBlockSize = 256;

const definition: AdapterDefinition = {

  name: 'Acorn Electron (Generic data)',

  internalName: 'electrongeneric',

  targetName: ElectronEncoder.getTargetName(),

  options: [
    nameOption, // 1 - 10 characters
    loadOption,
    entryOption,
    shortpilotOption,
  ],

  identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const filename = options.getArgument(nameOption);
    if (filename.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }

    const load = options.getArgument(loadOption) ?? 0x0000;
    const entry = options.getArgument(entryOption) ?? 0x0000;
    const shortpilot = options.isFlagSet(shortpilotOption);

    const chunks = ba.chunks(maxBlockSize);

    const e = new ElectronEncoder(recorder, options);
    e.begin();

    for (let block = 0; block < chunks.length; block++) {
      const isFirstBlock = block === 0;
      const isLastBlock = block === chunks.length - 1;
      const blockDataBa = chunks[block];

      const blockHeaderBa = BufferAccess.create(filename.length + 18);
      blockHeaderBa.writeAsciiString(filename);
      blockHeaderBa.writeUint8(0);
      blockHeaderBa.writeUint32Le(load | 0xffff0000); // TODO: why 32 bits?
      blockHeaderBa.writeUint32Le(entry | 0xffff0000); // TODO: why 32 bits?
      blockHeaderBa.writeUint16Le(block);
      blockHeaderBa.writeUint16Le(blockDataBa.length());
      blockHeaderBa.writeUint8(isLastBlock ? 0x80 : 0x00);
      blockHeaderBa.writeUint32Le(0xffffffff); // TODO: address of next file?

      const blockSize = 1 + blockHeaderBa.length() + 2 + blockDataBa.length() + (blockDataBa.length() > 0 ? 2 : 0);
      const blockBa = BufferAccess.create(blockSize);
      blockBa.writeUint8(0x2a); // sync byte
      blockBa.writeBa(blockHeaderBa);
      blockBa.writeUint16Be(calculateCrc(blockHeaderBa));
      blockBa.writeBa(blockDataBa);
      blockBa.writeUint16Be(calculateCrc(blockDataBa));

      Logger.debug(`Block 0x${block.toString(16).padStart(2, '0')}`);
      Logger.debug(blockBa.asHexDump());

      e.recordPilot(isFirstBlock ? (shortpilot ? 1.5 : 5.1) : 0.9);
      e.recordBytes(blockBa);
    }

    e.recordPilot(shortpilot ? 1.5 : 5.3);
    e.end();
  },
};
export default definition;

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
