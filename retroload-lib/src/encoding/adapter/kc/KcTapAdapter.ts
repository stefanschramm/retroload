import {KcEncoder} from './KcEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {Logger} from '../../../common/logging/Logger.js';
import {InputDataError} from '../../../common/Exceptions.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

const definition: AdapterDefinition = {
  name: 'KC .TAP-File',
  internalName: 'kctap',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = '\xc3KC-TAPE by AF.';
const fileHeaderLength = 16;
const blockSize = 128;
const fileBlockSize = 1 + blockSize; // 1 byte block number

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.tap$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const dataBa = ba.slice(fileHeaderLength);

  if (dataBa.length() === 0) {
    throw new InputDataError('TAP file is empty.');
  }
  if (dataBa.length() % fileBlockSize !== 0) {
    Logger.info(`Warning: Data length in TAP file is not a multiple of ${blockSize}. Will pad with zeroes.`);
  }

  const blocks = dataBa.chunksPadded(fileBlockSize);

  if (blocks.length > 0xff) {
    Logger.info('Warning: Got more than 256 blocks in TAP file.');
  }
  if (blocks[blocks.length - 1].getUint8(0) !== 0xff) {
    Logger.info('Warning: Last block in TAP file does not have block number 0xff.');
  }

  const e = new KcEncoder(recorder);

  e.begin();
  for (const blockBa of blocks) {
    const blockNumber = blockBa.getUint8(0);
    const blockData = blockBa.slice(1);
    e.recordBlock(blockNumber, blockData);
  }
  e.end();
}
