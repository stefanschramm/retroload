import {type DecoderSettings, type InternalDecoderDefinition, type OutputFile} from '../../DecoderManager.js';
import {type FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {KcBlockProcessor} from './KcBlockProcessor.js';
import {KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {Logger} from '../../../common/logging/Logger.js';
import {LowPassFilter} from '../../sample_provider/LowPassFilter.js';
import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';

const definition: InternalDecoderDefinition = {
  format: 'kctap',
  decode,
};
export default definition;

function * decode(sampleProvider: SampleProvider, settings: DecoderSettings): Generator<OutputFile> {
  const filteredSampleProvider = new LowPassFilter(sampleProvider, 11025);
  // high pass filtering doesn't seem to improve decoding (or is the implementation buggy?) :/
  // filteredSampleProvider = new HighPassFilter(filteredSampleProvider, 25);
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(filteredSampleProvider);
  const hpp = new KcHalfPeriodProcessor(streamingHalfPeriodProvider);
  const blockProcessor = new KcBlockProcessor(hpp, settings.onError === 'stop');

  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.blocks.length > 0 && (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile')) {
      yield bufferAccessListToOutputFile(fileDecodingResult);
    }
  }

  Logger.debug(`Total successful blocks: ${blockProcessor.getSuccessfulBlockCount()}`);
}

function bufferAccessListToOutputFile(fdr: FileDecodingResult): OutputFile {
  const {blocks} = fdr;
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of fdr.blocks) {
    data.writeBa(block.data.slice(0, 129)); // remove checksum
  }
  const firstBlockData = blocks[0].data;
  const isBasicProgram = firstBlockData.containsDataAt(0, '\x01\xd3\xd3\xd3') || firstBlockData.containsDataAt(0, '\x01\xd7\xd7\xd7');
  const filename = isBasicProgram ? firstBlockData.slice(4, 8).asAsciiString().trim() : firstBlockData.slice(1, 8).asAsciiString().trim();
  const proposedName = restrictCharacters(filename);

  return {proposedName, proposedExtension: 'tap', data, begin: fdr.begin, end: fdr.end};
}

function restrictCharacters(value: string): string {
  // eslint-disable-next-line require-unicode-regexp
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
