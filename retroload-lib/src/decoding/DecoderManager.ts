import {InternalError, UsageError} from '../common/Exceptions.js';
import {BufferAccess} from '../common/BufferAccess.js';
import Decoders from './decoder/Decoders.js';
import {type Position} from '../common/Positioning.js';
import {type SampleProvider} from './sample_provider/SampleProvider.js';
import {WaveFileSampleProvider} from './sample_provider/WaveFileSampleProvider.js';

export function decodeWav(data: Uint8Array, format: string, settings: DecoderSettings): Generator <OutputFile> {
  const decoder = getDecoder(format);
  const reader = new WaveFileSampleProvider(BufferAccess.createFromUint8Array(data), settings.skip, settings.channel);

  return decoder.decode(reader, settings);
}

function getDecoder(format: string): InternalDecoderDefinition {
  const availableDecoders = Decoders.filter((c) => c.format === format);
  if (availableDecoders.length === 0) {
    throw new UsageError(`No decoder for output format "${format}" found.`);
  }
  if (availableDecoders.length > 1) {
    throw new InternalError('Multiple decoders for same output format found.');
  }

  return availableDecoders[0];
}

export function getAllDecoders(): DecoderDefinition[] {
  return Decoders;
}

export type DecoderDefinition = {
  format: string;
};

export type InternalDecoderDefinition = DecoderDefinition & {
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
