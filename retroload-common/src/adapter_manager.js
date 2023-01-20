import * as ataricas from './formats/ataricas.js';
import * as c64prg from './formats/c64prg.js';
import * as c64tap from './formats/c64tap.js';
import * as c64t64 from './formats/c64t64.js';
import * as cpccdt from './formats/cpccdt.js';
import * as generic from './formats/generic.js';
import * as kckcc from './formats/kckcc.js';
import * as kcsss from './formats/kcsss.js';
import * as kctap from './formats/kctap.js';
import * as msxcas from './formats/msxcas.js';
import * as z1013z13 from './formats/z1013z13.js';
import * as z1013z80 from './formats/z1013z80.js';
import * as zx81p from './formats/zx81p.js';
import * as zxspectrumtap from './formats/zxspectrumtap.js';
import * as zxspectrumtzx from './formats/zxspectrumtzx.js';
import {ExtDataView} from './utils.js';
import {
  FormatAutodetectionFailedError,
  FormatNotFoundError,
  TargetMachineNotFoundError,
  TargetMachineNotSpecifiedError,
  InternalError,
  MissingOptionsError,
} from './exception.js';

const formats = [
  ataricas,
  c64prg,
  c64tap,
  c64t64,
  cpccdt,
  generic,
  kckcc,
  kcsss,
  kctap,
  msxcas,
  z1013z13,
  z1013z80,
  zx81p,
  zxspectrumtap,
  zxspectrumtzx,
];

/**
 * @param {WaveRecorder|PcmRecorder} recorder
 * @param {string} filename helps for identifiying the format by its extension
 * @param {ArrayBufferLike} data
 * @param {*} options
 * @return {boolean} true on success
 */
export function encode(recorder, filename, data, options={}) {
  const dataView = new ExtDataView(data);
  const format = (options.format === undefined) ?
    autodetectFormat(filename, dataView) :
    getFormatByInternalName(options.format)
  ;
  const adapter = determineAdapterToUse(format, options.machine);
  const requiredOptions = adapter.getOptions().filter((o) => o.required);
  const missingOptions = requiredOptions.filter((o) => options[o.key] === undefined);
  if (missingOptions.length > 0) {
    throw new MissingOptionsError(missingOptions);
  }

  console.debug('Format: ' + format.getName() + ', Target: ' + adapter.getTargetName());

  adapter.encode(recorder, dataView, options);

  return true;
}

export function getAllOptions() {
  const options = [];
  const optionKeys = [];
  for (const format of formats) {
    for (const adapter of format.getAdapters()) {
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
  }

  return options;
}

function autodetectFormat(filename, dataView) {
  const rankedFormats = getRankedFormatIdentifications(filename, dataView);

  if (rankedFormats.length > 1 && rankedFormats[0].score === rankedFormats[1].score) {
    throw new FormatAutodetectionFailedError();
  }

  return rankedFormats[0].format;
}

function getFormatByInternalName(name) {
  for (const format of formats) {
    if (format.getInternalName() === name) {
      return format;
    }
  }

  throw new FormatNotFoundError(name);
}

function getRankedFormatIdentifications(filename, dataView) {
  const formatIdentifications = formats.map(function(format) {
    const identifiation = format.identify(filename, dataView);
    const score =
      ((identifiation.header === true) ? 20 : 0) +
      ((identifiation.filename === true) ? 10 : 0)
    ;

    return {format, score};
  });

  const formatIdentificationsRanked = formatIdentifications.sort(function(a, b) {
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

  return formatIdentificationsRanked;
}

function determineAdapterToUse(format, requestedMachine) {
  const adapters = format.getAdapters();
  if (requestedMachine === undefined) {
    if (adapters.length > 1) {
      throw new TargetMachineNotSpecifiedError(format.getInternalName());
    }
    if (adapters.length === 1) {
      return adapters[0];
    }
  }
  for (const adapter of adapters) {
    if (adapter.getTargetName() === requestedMachine) {
      return adapter;
    }
  }

  throw new TargetMachineNotFoundError(requestedMachine, format.getInternalName());
}
