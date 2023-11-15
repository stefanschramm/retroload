import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type DecoderDefinition, type DecoderSettings, type OutputFile} from '../../DecoderManager.js';
import {type FileDecodingResult, FileDecodingResultStatus, Lc80HalfPeriodProcessor} from './Lc80HalfPeriodProcessor.js';

const definition: DecoderDefinition = {
  format: 'lc80generic',
  decode,
};
export default definition;

function * decode(sampleProvider: SampleProvider, settings: DecoderSettings): Generator<OutputFile> {
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
