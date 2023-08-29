import {type BufferAccess} from 'retroload-common';
import {UsageError} from '../Exceptions.js';
import {converters} from './ConverterProvider.js';

export function convert(ba: BufferAccess, from: string, to: string, settings: ConverterSettings): Generator <OutputFile> {
  const availableConverters = converters.filter((c) => c.from === from && c.to === to);
  if (availableConverters.length === 0) {
    throw new UsageError(`No converter for output format "${to}" found.`);
  }
  if (availableConverters.length > 1) {
    throw new UsageError('Multiple converters found.');
  }
  return availableConverters[0].convert(ba, settings);
}

export type ConverterDefinition = {
  from: string;
  to: string;
  convert(ba: BufferAccess, settings: ConverterSettings): Generator<OutputFile>;
};

export type OutputFile = {
  readonly proposedName: string | undefined;
  readonly data: BufferAccess;
  readonly proposedExtension: string;
};

export type ConverterSettings = {
  onError: ErrorHandlingType;
  /**
   * Number of samples to skip in input
   */
  skip: number;
};

export type ErrorHandlingType = 'stop' | 'skipfile' | 'ignore';
