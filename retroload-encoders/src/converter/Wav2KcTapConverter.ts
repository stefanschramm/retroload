import {BufferAccess} from 'retroload-common';
import {WaveDecoder} from '../decoder/WaveDecoder.js';
import {SampleToHalfPeriodConverter} from '../decoder/SampleToHalfPeriodConverter.js';
import {Logger} from '../Logger.js';
import {hex8} from '../Utils.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from './ConverterManager.js';
import {DecodingError} from './ConverterExceptions.js';
import {KcHalfPeriodProcessor} from './kc/KcHalfPeriodProcessor.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

function convert(ba: BufferAccess, settings: ConverterSettings): OutputFile[] {
  const sampleProvider = new WaveDecoder(ba);
  const halfPeriodProvider = new SampleToHalfPeriodConverter(sampleProvider);
  const hpp = new KcHalfPeriodProcessor(halfPeriodProvider, settings);
  let block: BufferAccess | undefined;
  let previousBlockNumber: number | undefined;
  const files: OutputFile[] = [];
  let blocks: BufferAccess[] = [];
  do {
    try {
      block = hpp.decodeBlock();
    } catch (e) {
      if (e instanceof DecodingError) {
        if (settings.onError === 'zerofill') {
          block = BufferAccess.create(129);
        }
      } else {
        throw e;
      }
    }
    const blockNumber = block?.getUint8(0);
    let nextFileDetected = false;
    if (blockNumber !== undefined && previousBlockNumber !== undefined) {
      if (blockNumber <= previousBlockNumber) {
        nextFileDetected = true;
        if (blockNumber !== 0 && blockNumber !== 1) {
          Logger.info(`Warning: Got first block with block number ${hex8(blockNumber)}`);
        }
      } else if (blockNumber > previousBlockNumber + 1 && blockNumber !== 0xff) {
        Logger.info(`Warning: Missing block. Got block number ${hex8(blockNumber)} but expected was ${hex8(previousBlockNumber + 1)}.`);
      }
    }
    if (nextFileDetected || (block === undefined && blocks.length > 0)) {
      files.push(bufferAccessListToOutputFile(blocks));
      // begin of a new file
      blocks = (block === undefined) ? [] : [block];
    } else if (block !== undefined) {
      blocks.push(block);
    }
    previousBlockNumber = blockNumber;
  } while (block !== undefined);

  return files;
}

function bufferAccessListToOutputFile(blocks: BufferAccess[]): OutputFile {
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of blocks) {
    data.writeBa(block);
  }
  const filename = data.slice(0x14, 8).asAsciiString().trim();
  const proposedName = `${restrictCharacters(filename)}.tap`;

  return {proposedName, data};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
