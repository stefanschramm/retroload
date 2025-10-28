import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {Ibm5150Encoder, blockSize} from './Ibm5150Encoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for IBM PC 5150 (for raw blocks to be read using the BIOS routines)
 */
export const Ibm5150GenericAdapter: InternalAdapterDefinition = {
  label: 'IBM 5150 (Generic data)',
  name: 'ibm5150generic',
  options: [],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new Ibm5150Encoder(recorder);

  if (ba.length() % blockSize !== 0) {
    // Tech reference says that a block is actually padded using the last byte of actual data.
    // But I think it doesn't matter here.
    Logger.info(`Data is not a multiple of block size (${blockSize}). Last block will be padded with zeros.`);
  }

  e.begin();
  e.recordSyncSequence();
  for (const chunk of ba.chunksPadded(blockSize, 0)) {
    e.recordBlock(chunk);
  }
  e.recordEndOfDataSequence();
  e.end();
}
