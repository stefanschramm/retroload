import {
  FormatAutodetectionFailedError,
  FormatNotFoundError,
  InternalError,
  MissingOptionsError,
} from '../common/Exceptions.js';
import {type BufferAccess} from '../common/BufferAccess.js';
import {adapters as providedAdapters} from './AdapterProvider.js';
import {Logger} from '../common/logging/Logger.js';
import {OptionContainer, type PublicOptionDefinition, type OptionValues} from './Options.js';
import {type RecorderInterface} from './recorder/RecorderInterface.js';
import {type ArgumentOptionDefinition} from './Options.js';
import {type PublicAdapterDefinition, type AdapterDefinition} from './adapter/AdapterDefinition.js';

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

export function encode(recorder: RecorderInterface, filename: string, dataBa: BufferAccess, optionValues: OptionValues = {}) {
  const optionContainer = new OptionContainer(optionValues);
  const format = optionContainer.getArgument(formatOption);
  let filteredAdapters = providedAdapters;
  if (format !== undefined) {
    filteredAdapters = filteredAdapters.filter((a) => a.internalName === format);
    if (filteredAdapters.length === 0) {
      throw new FormatNotFoundError(format);
    }
  }
  const adapter = filteredAdapters.length === 1 ? filteredAdapters[0] : autodetectAdapter(filteredAdapters, filename, dataBa);

  return encodeWithAdapter(recorder, adapter, dataBa, optionValues);
}

export function encodeWith(recorder: RecorderInterface, adapterDefinition: PublicAdapterDefinition, dataBa: BufferAccess, optionValues: OptionValues = {}) {
  const adapter = providedAdapters.filter((a) => a.internalName === adapterDefinition.internalName)[0];
  return encodeWithAdapter(recorder, adapter, dataBa, optionValues);
}

function encodeWithAdapter(recorder: RecorderInterface, adapter: AdapterDefinition, dataBa: BufferAccess, optionValues: OptionValues = {}) {
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

/**
 * Identify tape file and return matching adapter
 */
export function identify(filename: string, dataBa: BufferAccess) : (PublicAdapterDefinition | undefined) {
  try {
    return autodetectAdapter(providedAdapters, filename, dataBa);
  } catch (e) {
    if (e instanceof FormatAutodetectionFailedError) {
      return undefined;
    }
    throw e;
  }
}

export function getAllAdapters(): PublicAdapterDefinition[] {
  return providedAdapters;
}

export function getAllOptions(): PublicOptionDefinition[] {
  const options: PublicOptionDefinition[] = [];
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

function autodetectAdapter(adapters: AdapterDefinition[], filename: string, ba: BufferAccess) {
  const rankedAdapters = getRankedAdapters(adapters, filename, ba);

  if (rankedAdapters.length > 1 && rankedAdapters[0].score > rankedAdapters[1].score) {
    return rankedAdapters[0].adapter;
  }

  throw new FormatAutodetectionFailedError();
}

function mapBoolishToScore(value: boolean | undefined, score: number) {
  if (value === true) {
    return score;
  }
  if (value === false) {
    return -score;
  }

  return 0;
}

function getRankedAdapters(adapters: AdapterDefinition[], filename: string, ba: BufferAccess) {
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
