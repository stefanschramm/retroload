import {BufferAccess} from 'retroload-common';
import {WaveDecoder} from '../../decoder/WaveDecoder.js';
import {SampleToHalfPeriodConverter} from '../../decoder/SampleToHalfPeriodConverter.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from '../ConverterManager.js';
import {KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {FileDecodingResultStatus, KcBlockProcessor} from './KcBlockProcessor.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

function * convert(ba: BufferAccess, settings: ConverterSettings): Generator<OutputFile> {
  const sampleProvider = new WaveDecoder(ba, settings.skip);
  const halfPeriodProvider = new SampleToHalfPeriodConverter(sampleProvider);
  const hpp = new KcHalfPeriodProcessor(halfPeriodProvider);
  const blockProcessor = new KcBlockProcessor(hpp, settings);

  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
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
  const proposedName = `${restrictCharacters(filename)}.tap`;

  return {proposedName, data};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
