import {BufferAccess} from '../../../common/BufferAccess.js';
import {type SampleProvider, WaveDecoder} from '../../decoder/WaveDecoder.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from '../ConverterManager.js';
import {KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {FileDecodingResultStatus, KcBlockProcessor} from './KcBlockProcessor.js';
import {StreamingSampleToHalfPeriodConverter} from '../../decoder/StreamingSampleToHalfPeriodConverter.js';
import {LowPassFilter} from '../../decoder/LowPassFilter.js';
import {Logger} from '../../../common/logging/Logger.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

function * convert(ba: BufferAccess, settings: ConverterSettings): Generator<OutputFile> {
  let sampleProvider: SampleProvider = new WaveDecoder(ba, settings.skip, settings.channel);
  sampleProvider = new LowPassFilter(sampleProvider, 11025);
  // high pass filtering doesn't seem to improve decoding (or is the implementation buggy?) :/
  // sampleProvider = new HighPassFilter(sampleProvider, 25);
  const streamingHalfPeriodProvider = new StreamingSampleToHalfPeriodConverter(sampleProvider);
  const hpp = new KcHalfPeriodProcessor(streamingHalfPeriodProvider);
  const blockProcessor = new KcBlockProcessor(hpp, settings);

  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.blocks.length > 0 && (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile')) {
      yield bufferAccessListToOutputFile(fileDecodingResult.blocks);
    }
  }

  Logger.debug(`Total successful blocks: ${blockProcessor.getSuccessfulBlockCount()}`);
}

function bufferAccessListToOutputFile(blocks: BufferAccess[]): OutputFile {
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of blocks) {
    data.writeBa(block);
  }
  const isBasicProgram = blocks[0].containsDataAt(0, '\x01\xd3\xd3\xd3') || blocks[0].containsDataAt(0, '\x01\xd7\xd7\xd7');
  const filename = isBasicProgram ? blocks[0].slice(4, 8).asAsciiString().trim() : blocks[0].slice(1, 8).asAsciiString().trim();
  const proposedName = restrictCharacters(filename);

  return {proposedName, data, proposedExtension: 'tap'};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
