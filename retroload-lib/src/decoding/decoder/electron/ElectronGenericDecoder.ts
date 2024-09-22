import {Logger} from '../../../common/logging/Logger.js';
import {type DecoderDefinition, type DecoderSettings, type OutputFile} from '../../DecoderManager.js';
import {StreamingSampleToHalfPeriodConverter} from '../../half_period_provider/StreamingSampleToHalfPeriodConverter.js';
import {type SampleProvider} from '../../sample_provider/SampleProvider.js';
import {ElectronHalfPeriodProcessor} from './ElectronHalfPeriodProcessor.js';

const definition: DecoderDefinition = {
  format: 'electrongeneric',
  decode,
};
export default definition;

function * decode(sampleProvider: SampleProvider, _settings: DecoderSettings): Generator<OutputFile> {
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const hpp = new ElectronHalfPeriodProcessor(streamingHalfPeriodProvider);
  // const blockProcessor = new KcBlockProcessor(hpp, settings.onError === 'stop');
  for (const b of hpp.blocks()) {
    Logger.debug(b.data.asHexDump());
  }

  /*
  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.blocks.length > 0 && (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile')) {
      yield bufferAccessListToOutputFile(fileDecodingResult);
    }
  }
  */

  for (const f of []) {
    yield f;
  }
  // Logger.debug(`Total successful blocks: ${blockProcessor.getSuccessfulBlockCount()}`);
}
