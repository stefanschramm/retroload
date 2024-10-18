#!/usr/bin/env node

import {Exception, Logger, version as libVersion, type Annotation, formatPosition, getEncodingAdapters, getAllEncodingOptions, encodeUint8Wav, identify, type EncodingResult, encodeUint8, type OptionDefinition} from 'retroload-lib';
import {Option} from 'commander';
import {type PlayerWrapper} from './player/PlayerWrapper.js';
import {SpeakerWrapper} from './player/SpeakerWrapper.js';
import {AplayWrapper} from './player/AplayWrapper.js';
import {SoxWrapper} from './player/SoxWrapper.js';
import {version as cliVersion} from './version.js';
import {readFile, writeFile} from './Utils.js';
import {CustomCommand} from './help/CustomCommand.js';

const playerWrapperPriority = [
  SpeakerWrapper,
  AplayWrapper,
  SoxWrapper,
];

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main(): Promise<void> {
  const formatNames = getEncodingAdapters().map((a) => a.internalName);
  formatNames.sort();
  const program = (new CustomCommand(getEncodingAdapters()))
    .name('retroload')
    .description('Play tape archive files of historical computers for loading them on real devices or convert them to WAVE files.')
    .argument('infile', 'Path to file to play (default) or convert (when using -o <outfile> option)')
    .allowExcessArguments(false)
    .option('-o <outfile>', 'Generate WAVE file <outfile> instead of playback')
    .option('-f, --format <format>', 'Format of input file (required when automatic format detection by content and filename fails). See list below for supported formats.')
    .option('-l, --loglevel <loglevel>', 'Verbosity of log output', '1')
    .option('-a, --annotations', 'Output annotations (if available)')
    .version(`retroload: ${cliVersion}\nretroload-lib: ${libVersion}`)
    .showHelpAfterError();
  // Options defined in adapters/encoders
  const allOptions = getAllEncodingOptions();
  allOptions.sort((a, b) => a.common && !b.common ? -1 : 0);
  for (const option of allOptions) {
    program.addOption(new Option(getCommanderFlagsString(option), option.description).hideHelp());
  }
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  const outfile = typeof options['o'] === 'string' ? options['o'] : undefined;
  let format = typeof options['f'] === 'string' ? options['f'] : undefined;
  Logger.setVerbosity(parseInt(typeof options['loglevel'] === 'string' ? options['loglevel'] : '1', 10));
  const data = readFile(infile);

  Logger.debug(`Processing ${infile}...`);

  let result: EncodingResult<Uint8Array>;
  try {
    if (format === undefined) {
      format = identify(data, infile);
      if (format === undefined) {
        Logger.error(`Unable to identify ${infile}. Please specify format.`);
        process.exit(1);
      }
    }
    if (undefined === outfile) {
      result = encodeUint8(format, data, options);
    } else {
      result = encodeUint8Wav(format, data, options);
    }
  } catch (e) {
    if (e instanceof Exception.UsageError) {
      Logger.error(e.message);
      process.exit(1);
    } else {
      throw e; // show full stack trace for unexpected errors
    }
  }

  if (options['annotations']) {
    printAnnotations(result.annotations);
  }

  if (undefined === outfile) {
    // play
    const playerWrapper = await getPlayerWrapper();
    await playerWrapper.play(result.data);
    Logger.info('Finished.');
    process.exit(0);
  } else {
    // save
    writeFile(outfile, result.data);
    process.exit(0);
  }
}

function getCommanderFlagsString(optionDefinition: OptionDefinition): string {
  return optionDefinition.type !== 'text' || optionDefinition.argument === undefined ? `--${optionDefinition.name}` : `--${optionDefinition.name} <${optionDefinition.argument}>`;
}

async function getPlayerWrapper(): Promise<PlayerWrapper> {
  for (const wrapper of playerWrapperPriority) {
    // eslint-disable-next-line no-await-in-loop
    const pw = await wrapper.create(44100, 8, 1);
    if (pw !== undefined) {
      return pw;
    }
  }

  const msg = `
  No player found. retroload supports the following options for playing audio:

  speaker library:
  Install it using "npm install speaker". To install (and build) it, you may need to install additional system packages like build-essential and libasound2-dev.

  aplay:
  Usually part of the "alsa-utils" package. Try installing it using "apt-get install alsa-utils" or "yum install alsa-utils".

  (SoX) play:
  Part of the SoX package. Try installing it using "apt-get install sox" or "yum installs sox".
  `;
  Logger.error(msg);
  process.exit(1);
}

function printAnnotations(annotations: Annotation[], depth = 0): void {
  for (const annotation of annotations) {
    const indentation = '  '.repeat(depth);
    const range = annotation.end === undefined
      ? formatPosition(annotation.begin)
      : `${formatPosition(annotation.begin)} - ${formatPosition(annotation.end)}`;
    const line = `${range} ${indentation}${annotation.label}\n`;
    process.stdout.write(line);

    printAnnotations(annotation.annotations, depth + 1);
  }
}
