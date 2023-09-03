import {type BufferAccess} from '../common/BufferAccess.js';
import {InternalError, UsageError} from '../common/Exceptions.js';
import {type Position} from '../common/Positioning.js';
import {type SampleProvider} from './sample_provider/SampleProvider.js';
import {WaveFileSampleProvider} from './sample_provider/WaveFileSampleProvider.js';
import WriterProvider from './writer/WriterProvider.js';

export function convertWav(ba: BufferAccess, to: string, settings: ConverterSettings): Generator <OutputFile> {
  const writer = getWriter(to);
  const reader = new WaveFileSampleProvider(ba, settings.skip, settings.channel);

  return writer.convert(reader, settings);
}

function getWriter(to: string): WriterDefinition {
  const availableWriters = WriterProvider.filter((c) => c.to === to);
  if (availableWriters.length === 0) {
    throw new UsageError(`No converter for output format "${to}" found.`);
  }
  if (availableWriters.length > 1) {
    throw new InternalError('Multiple writers for same output format found.');
  }

  return availableWriters[0];
}

export function getAllWriters(): WriterDefinition[] {
  return WriterProvider;
}

export type WriterDefinition = {
  to: string;
  convert(sampleProvider: SampleProvider, settings: ConverterSettings): Generator<OutputFile>;
};

export type OutputFile = {
  readonly proposedName: string | undefined;
  readonly data: BufferAccess;
  readonly proposedExtension: string;
  readonly begin: Position;
  readonly end: Position;
};

export type ConverterSettings = {
  /**
   * What to do when errors occur
   */
  onError: ErrorHandlingType;
  /**
   * Number of samples to skip in input
   */
  skip: number;
  /**
   * Channel to get samples from
   */
  channel: number | undefined;
};

export type ErrorHandlingType = 'stop' | 'skipfile' | 'ignore';
