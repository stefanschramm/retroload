import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type DecoderDefinition, type DecoderSettings, type OutputFile} from '../../DecoderManager.js';
import {PcBlockProcessor} from './PcBlockProcessor.js';
import {type FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {BufferAccess} from '../../../common/BufferAccess.js';

const definition: DecoderDefinition = {
  format: 'pcgeneric',
  decode: convert,
};
export default definition;

function * convert(sampleProvider: SampleProvider, settings: DecoderSettings): Generator<OutputFile> {
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const blockProcessor = new PcBlockProcessor(streamingHalfPeriodProvider);
  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
      yield mapDecodingResult(fileDecodingResult);
    }
  }
}

function mapDecodingResult(fdr: FileDecodingResult): OutputFile {
  const fileDataBa = BufferAccess.create(256 * fdr.blocks.length);
  for (const block of fdr.blocks) {
    fileDataBa.writeBa(block.data.slice(0, 256)); // the 2 checksum bytes are removed
  }

  return {
    proposedName: undefined,
    data: fileDataBa,
    proposedExtension: 'bin',
    begin: fdr.begin,
    end: fdr.end,
  };
}
