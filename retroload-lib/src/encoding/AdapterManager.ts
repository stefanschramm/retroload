import {
  FormatNotFoundError,
  InternalError,
  MissingOptionsError,
} from '../common/Exceptions.js';
import {BufferAccess} from '../common/BufferAccess.js';
import {adapters, adapters as providedAdapters} from './AdapterProvider.js';
import {Logger} from '../common/logging/Logger.js';
import {OptionContainer, type OptionDefinition, type OptionValues} from './Options.js';
import {type RecorderInterface} from './recorder/RecorderInterface.js';
import {type ArgumentOptionDefinition} from './Options.js';
import {type AdapterDefinition, type InternalAdapterDefinition} from './adapter/AdapterDefinition.js';
import {type Annotation} from './recorder/Annotations.js';
import {WaveRecorder} from './recorder/WaveRecorder.js';

export const formatOption: ArgumentOptionDefinition<string | undefined> = {
  name: 'format',
  label: 'Format',
  description: 'Format of input file (required when automatic format detection by content and filename fails)',
  common: false,
  type: 'text',
  argument: 'format',
  required: false,
  parse: (v) => v === '' ? undefined : v,
  enum: [...new Set(providedAdapters.map((a) => a.internalName))],
};

// Public API functions

/**
 * Get all encoding adapter definitions
 */
export function getEncodingAdapters(): AdapterDefinition[] {
  return providedAdapters;
}

/**
 * Get all encoding adapter options in a single array
 */
export function getAllEncodingOptions(): OptionDefinition[] {
  const options: OptionDefinition[] = [];
  const optionKeys: string[] = [];
  for (const adapter of providedAdapters) {
    for (const option of adapter.options) {
      if (optionKeys.includes(option.name)) {
        if (option.common) {
          continue;
        }
        throw new InternalError(`Non-common option "${option.name}" defined multiple times.`);
      }
      optionKeys.push(option.name);
      options.push(option);
    }
  }

  return options;
}

/**
 * Try to identify tape archive file by its data and filename
 *
 * @returns adapter identifier on success, otherwise undefined
 */
export function identify(data: Uint8Array, filename: string): string | undefined {
  const rankedAdapters = getRankedAdapters(adapters, filename, BufferAccess.createFromUint8Array(data));

  if (rankedAdapters.length > 1 && rankedAdapters[0].score > rankedAdapters[1].score) {
    return rankedAdapters[0].adapter.internalName;
  }

  return undefined;
}

/**
 * Holds the result of encode functions
 */
export type EncodingResult = {
  data: Uint8Array;
  annotations: Annotation[];
};

/**
 * Encode a tape archive file using the specified adapter as raw samples (1 channel, 8 bit unsigned, 44100 Hz sample rate)
 */
export function encodeUint8(adapterIdentifier: string, data: Uint8Array, optionValues: OptionValues): EncodingResult {
  const recorder = new WaveRecorder();
  encodeWithAdapter(recorder, getAdapterByIdentifier(adapterIdentifier), BufferAccess.createFromUint8Array(data), optionValues);

  return {
    data: recorder.getRawBuffer(),
    annotations: recorder.getAnnotations(),
  };
}

/**
 * Encode a tape archive file using the specified adapter as WAV file (1 channel, 8 bit unsigned, 44100 Hz sample rate)
 */
export function encodeUint8Wav(adapterIdentifier: string, data: Uint8Array, optionValues: OptionValues): EncodingResult {
  const recorder = new WaveRecorder();
  encodeWithAdapter(recorder, getAdapterByIdentifier(adapterIdentifier), BufferAccess.createFromUint8Array(data), optionValues);

  return {
    data: recorder.getBa().asUint8Array(),
    annotations: recorder.getAnnotations(),
  };
}

// TODO:
// export function encodeFloat(adapterIdentifier: string, data: Uint8Array, optionValues: OptionValues): EncodingResult {

// Internal functions

function getAdapterByIdentifier(adapterIdentifier: string): InternalAdapterDefinition {
  const foundAdapters = adapters.filter((a) => a.internalName === adapterIdentifier);
  if (foundAdapters.length !== 1) {
    throw new FormatNotFoundError('Adapter not found');
  }

  return foundAdapters[0];
}

function encodeWithAdapter(recorder: RecorderInterface, adapter: InternalAdapterDefinition, dataBa: BufferAccess, optionValues: OptionValues = {}): boolean {
  const optionContainer = new OptionContainer(optionValues);
  const requiredOptions = adapter.options.filter((o) => o.type !== 'bool' && o.required);
  const missingOptions = requiredOptions.filter((o) => optionValues[o.name] === undefined);
  if (missingOptions.length > 0) {
    throw new MissingOptionsError(missingOptions);
  }

  Logger.info(`Format: ${adapter.name} (${adapter.internalName})`);

  adapter.encode(recorder, dataBa, optionContainer);

  return true;
}

function mapBoolishToScore(value: boolean | undefined, score: number): number {
  if (value === true) {
    return score;
  }
  if (value === false) {
    return -score;
  }

  return 0;
}

type RankedAdapter = {
  adapter: InternalAdapterDefinition;
  score: number;
};

function getRankedAdapters(adapters: InternalAdapterDefinition[], filename: string, ba: BufferAccess): RankedAdapter[] {
  const adapterIdentifications = adapters.map((adapter) => {
    const identifiation = adapter.identify(filename, ba);
    const score = mapBoolishToScore(identifiation.header, 20) + mapBoolishToScore(identifiation.filename, 10);

    return {adapter, score};
  });

  const adapterIdentificationsRanked = adapterIdentifications.sort((a, b) => {
    if (a.score > b.score) {
      return -1;
    }
    if (a.score < b.score) {
      return 1;
    }
    if (a.score === b.score) {
      return 0;
    }
    throw new InternalError('Should not happen.');
  });

  return adapterIdentificationsRanked;
}
