import {BufferAccess} from '../../../common/BufferAccess.js';
import {type ConverterSettings, type OutputFile, type WriterDefinition} from '../../ConverterManager.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {type FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {Z1013BlockProcessor} from './Z1013BlockProcessor.js';
import {Z1013HalfPeriodProcessor} from './Z1013HalfPeriodProcessor.js';

const definition: WriterDefinition = {
  to: 'z1013generic',
  convert,
};
export default definition;

function * convert(sampleProvider: SampleProvider, settings: ConverterSettings): Generator<OutputFile> {
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const bp = new Z1013BlockProcessor(new Z1013HalfPeriodProcessor(streamingHalfPeriodProvider));
  for (const fdr of bp.files()) {
    if (fdr.status !== FileDecodingResultStatus.Success || settings.onError !== 'skipfile') {
      yield mapFileDecodingResult(fdr);
    }
  }
}

function mapFileDecodingResult(fdr: FileDecodingResult): OutputFile {
  const data = BufferAccess.create(fdr.blocks.length * 32);
  for (const block of fdr.blocks) {
    // block number and checksum are stripped from output
    data.writeBa(block.data.slice(2, 32));
  }

  return {
    proposedName: undefined,
    data,
    proposedExtension: 'bin',
    begin: fdr.begin,
    end: fdr.end,
  };
}
