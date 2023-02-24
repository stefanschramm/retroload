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

/**
 * @param {WaveRecorder|PcmRecorder} recorder
 * @param {string} filename helps for identifiying the format by its extension
 * @param {ArrayBufferLike} data
 * @param {*} options
 * @return {boolean} true on success
 */
export function encode(recorder, filename, data, options={}) {
  const ba = new BufferAccess(data);

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
  const adapter =
    filteredAdapters.length === 1 ?
    filteredAdapters[0] :
    autodetectAdapter(filteredAdapters, filename, ba)
  ;

  const requiredOptions = adapter.getOptions().filter((o) => o.required);
  const missingOptions = requiredOptions.filter((o) => options[o.key] === undefined);
  if (missingOptions.length > 0) {
    throw new MissingOptionsError(missingOptions);
  }

  Logger.info('Format: ' + adapter.getName() + ', Target: ' + adapter.getTargetName());

  adapter.encode(recorder, ba, options);

  return true;
}

export function getAllOptions() {
  const options = [];
  const optionKeys = [];
  for (const adapter of providedAdapters) {
    for (const option of adapter.getOptions()) {
      if (optionKeys.indexOf(option.key) !== -1) {
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
  const adapterIdentifications = adapters.map(function(adapter) {
    const identifiation = adapter.identify(filename, ba);
    const score = mapBoolishToScore(identifiation.header, 20) + mapBoolishToScore(identifiation.filename, 10);

    return {adapter: adapter, score};
  });

  const adapterIdentificationsRanked = adapterIdentifications.sort(function(a, b) {
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
