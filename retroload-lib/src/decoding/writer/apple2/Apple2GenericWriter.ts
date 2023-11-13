import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type WriterDefinition, type ConverterSettings, type OutputFile} from '../../ConverterManager.js';
import {Apple2HalfPeriodProcessor} from './Apple2HalfPeriodProcessor.js';
import {type FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';

const definition: WriterDefinition = {
  to: 'apple2generic',
  convert,
};
export default definition;

function * convert(sampleProvider: SampleProvider, settings: ConverterSettings): Generator<OutputFile> {
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);

  const hpp = new Apple2HalfPeriodProcessor(streamingHalfPeriodProvider);

  for (const fileDecodingResult of hpp.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
      yield bufferAccessListToOutputFile(fileDecodingResult);
    }
  }
}

function bufferAccessListToOutputFile(fdr: FileDecodingResult): OutputFile {
  return {
    proposedName: undefined,
    data: fdr.blocks[0].data, // files don't consist of blocks
    proposedExtension: 'bin',
    begin: fdr.begin,
    end: fdr.end,
  };
}
