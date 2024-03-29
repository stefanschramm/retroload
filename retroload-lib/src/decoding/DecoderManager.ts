import {type BufferAccess} from '../common/BufferAccess.js';
import {InternalError, UsageError} from '../common/Exceptions.js';
import {type Position} from '../common/Positioning.js';
import {type SampleProvider} from './sample_provider/SampleProvider.js';
import {WaveFileSampleProvider} from './sample_provider/WaveFileSampleProvider.js';
import DecoderProvider from './decoder/DecoderProvider.js';

export function decodeWav(ba: BufferAccess, format: string, settings: DecoderSettings): Generator <OutputFile> {
  const decoder = getDecoder(format);
  const reader = new WaveFileSampleProvider(ba, settings.skip, settings.channel);

  return decoder.decode(reader, settings);
}

function getDecoder(format: string): DecoderDefinition {
  const availableDecoders = DecoderProvider.filter((c) => c.format === format);
  if (availableDecoders.length === 0) {
    throw new UsageError(`No decoder for output format "${format}" found.`);
  }
  if (availableDecoders.length > 1) {
    throw new InternalError('Multiple decoders for same output format found.');
  }

  return availableDecoders[0];
}

export function getAllDecoders(): DecoderDefinition[] {
  return DecoderProvider;
}

export type DecoderDefinition = {
  format: string;
  decode(sampleProvider: SampleProvider, settings: DecoderSettings): Generator<OutputFile>;
};

export type OutputFile = {
  readonly proposedName: string | undefined;
  readonly data: BufferAccess;
  readonly proposedExtension: string;
  readonly begin: Position;
  readonly end: Position;
};

export type DecoderSettings = {
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
