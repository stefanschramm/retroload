import {
  FormatAutodetectionFailedError,
  FormatNotFoundError,
  TargetMachineNotFoundError,
  InternalError,
  MissingOptionsError,
} from './Exceptions.js';
import {BufferAccess} from './BufferAccess.js';
import {adapters as providedAdapters} from './AdapterProvider.js';
import {Logger} from './Logger.js';
import {type AbstractAdapter} from './adapter/AbstractAdapter.js';

export function encode(recorder, filename, data: ArrayBufferLike, options: any = {}) {
  let filteredAdapters = providedAdapters;
  if (options.format !== undefined) {
    filteredAdapters = filteredAdapters.filter((a) => a.getInternalName() === options.format);
    if (filteredAdapters.length === 0) {
      throw new FormatNotFoundError(options.format);
    }
  }
  if (options.machine !== undefined) {
    filteredAdapters = filteredAdapters.filter((a) => a.getTargetName() === options.machine);
    if (filteredAdapters.length === 0) {
      throw new TargetMachineNotFoundError(options.machine, options.format);
    }
  }
  const dataBa = new BufferAccess(data);
  const adapter = filteredAdapters.length === 1 ? filteredAdapters[0] : autodetectAdapter(filteredAdapters, filename, dataBa);

  return encodeWithAdapter(recorder, adapter, dataBa, options);
}

export function encodeWithAdapter(recorder, adapter, dataBa, options: any = {}) {
  const requiredOptions = adapter.getOptions().filter((o) => o.required);
  const missingOptions = requiredOptions.filter((o) => options[o.key] === undefined);
  if (missingOptions.length > 0) {
    throw new MissingOptionsError(missingOptions);
  }

  Logger.info('Format: ' + adapter.getName() + ', Target: ' + adapter.getTargetName());

  adapter.encode(recorder, dataBa, options);

  return true;
}

/**
 * Identify tape file and return matching adapter
 */
export function identify(filename: string, dataBa: BufferAccess) : (AbstractAdapter | null) {
  try {
    return autodetectAdapter(providedAdapters, filename, dataBa);
  } catch (e) {
    if (e instanceof FormatAutodetectionFailedError) {
      return null;
    }
    throw e;
  }
}

export function getAllAdapters() {
  return providedAdapters;
}

export function getAllOptions() {
  const options: any[] = [];
  const optionKeys: string[] = [];
  for (const adapter of providedAdapters) {
    for (const option of adapter.getOptions()) {
      if (optionKeys.includes(option.key)) {
        if (option.common) {
          continue;
        }
        throw new InternalError(`Non-common option "${option.key}" defined multiple times.`);
      }
      optionKeys.push(option.key);
      options.push(option);
    }
  }

  return options;
}

function autodetectAdapter(adapters, filename, ba) {
  const rankedAdapters = getRankedAdapters(adapters, filename, ba);

  if (rankedAdapters.length > 1 && rankedAdapters[0].score > rankedAdapters[1].score) {
    return rankedAdapters[0].adapter;
  }

  throw new FormatAutodetectionFailedError();
}

function mapBoolishToScore(value, score) {
  if (value === true) {
    return score;
  }
  if (value === false) {
    return -score;
  }

  return 0;
}

function getRankedAdapters(adapters, filename, ba) {
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
