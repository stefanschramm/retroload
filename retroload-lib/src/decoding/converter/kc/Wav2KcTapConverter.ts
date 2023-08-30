import {BufferAccess} from '../../../common/BufferAccess.js';
import {WaveDecoder} from '../../decoder/WaveDecoder.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from '../ConverterManager.js';
import {KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {FileDecodingResultStatus, KcBlockProcessor} from './KcBlockProcessor.js';
import {StreamingSampleToHalfPeriodConverter} from '../../decoder/StreamingSampleToHalfPeriodConverter.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

function * convert(ba: BufferAccess, settings: ConverterSettings): Generator<OutputFile> {
  const sampleProvider = new WaveDecoder(ba, settings.skip);
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const hpp = new KcHalfPeriodProcessor(streamingHalfPeriodProvider);
  const blockProcessor = new KcBlockProcessor(hpp, settings);

  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.blocks.length > 0 && (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile')) {
      yield bufferAccessListToOutputFile(fileDecodingResult.blocks);
    }
  }
}

function bufferAccessListToOutputFile(blocks: BufferAccess[]): OutputFile {
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of blocks) {
    data.writeBa(block);
  }
  const filename = data.slice(0x14, 8).asAsciiString().trim();
  const proposedName = restrictCharacters(filename);

  return {proposedName, data, proposedExtension: 'tap'};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
