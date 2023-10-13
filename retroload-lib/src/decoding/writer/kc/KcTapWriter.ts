import {BufferAccess} from '../../../common/BufferAccess.js';
import {KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {type FileDecodingResult, FileDecodingResultStatus, KcBlockProcessor} from './KcBlockProcessor.js';
import {LowPassFilter} from '../../sample_provider/LowPassFilter.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type WriterDefinition, type ConverterSettings, type OutputFile} from '../../ConverterManager.js';

const definition: WriterDefinition = {
  to: 'kctap',
  convert,
};
export default definition;

function * convert(sampleProvider: SampleProvider, settings: ConverterSettings): Generator<OutputFile> {
  sampleProvider = new LowPassFilter(sampleProvider, 11025);
  // high pass filtering doesn't seem to improve decoding (or is the implementation buggy?) :/
  // sampleProvider = new HighPassFilter(sampleProvider, 25);
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
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
    data.writeBa(block);
  }
  const isBasicProgram = blocks[0].containsDataAt(0, '\x01\xd3\xd3\xd3') || blocks[0].containsDataAt(0, '\x01\xd7\xd7\xd7');
  const filename = isBasicProgram ? blocks[0].slice(4, 8).asAsciiString().trim() : blocks[0].slice(1, 8).asAsciiString().trim();
  const proposedName = restrictCharacters(filename);

  return {proposedName, proposedExtension: 'tap', data, begin: fdr.begin, end: fdr.end};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}