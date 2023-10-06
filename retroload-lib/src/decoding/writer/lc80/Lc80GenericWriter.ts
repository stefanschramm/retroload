import {LowPassFilter} from '../../sample_provider/LowPassFilter.js';
import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type WriterDefinition, type ConverterSettings, type OutputFile} from '../../ConverterManager.js';
import {type FileDecodingResult, FileDecodingResultStatus, Lc80HalfPeriodProcessor} from './Lc80HalfPeriodProcessor.js';

const definition: WriterDefinition = {
  to: 'lc80generic',
  convert,
};
export default definition;

function * convert(sampleProvider: SampleProvider, settings: ConverterSettings): Generator<OutputFile> {
  // TODO: Real recording has bad zero crossings.
  sampleProvider = new LowPassFilter(sampleProvider, 11025);
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);

  const hpp = new Lc80HalfPeriodProcessor(streamingHalfPeriodProvider);

  for (const fileDecodingResult of hpp.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
      yield bufferAccessListToOutputFile(fileDecodingResult);
    }
  }
}

function bufferAccessListToOutputFile(fdr: FileDecodingResult): OutputFile {
  const proposedName = [
    formatHex16(fdr.fileNumber),
    formatHex16(fdr.startAddress),
    formatHex16(fdr.endAddress),
  ].join('_');

  return {proposedName, data: fdr.data, proposedExtension: 'bin', begin: fdr.begin, end: fdr.end};
}

function formatHex16(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, '0');
}
