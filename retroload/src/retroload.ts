#!/usr/bin/env node

import {WaveRecorder, AdapterManager, Exception, Logger, version as libVersion, type PublicOptionDefinition} from 'retroload-lib';
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

async function main() {
  const formatNames = AdapterManager.getAllAdapters().map((a) => a.internalName);
  formatNames.sort();
  const program = (new CustomCommand(AdapterManager.getAllAdapters()))
    .name('retroload')
    .description('Play tape archive files of historical computers for loading them on real devices or convert them to WAVE files.')
    .argument('infile', 'Path to file to play (default) or convert (when using -o <outfile> option)')
    .allowExcessArguments(false)
    .option('-o <outfile>', 'Generate WAVE file <outfile> instead of playback')
    .option('-f, ' + getCommanderFlagsString(AdapterManager.formatOption), `${AdapterManager.formatOption.description}. See list below for supported formats.`)
    .option('-l, --loglevel <loglevel>', 'Verbosity of log output', '1')
    .version(`retroload: ${cliVersion}\nretroload-lib: ${libVersion}`)
    .showHelpAfterError();
  // Options defined in adapters/encoders
  const allOptions = AdapterManager.getAllOptions();
  allOptions.sort((a, b) => a.common && !b.common ? -1 : 0);
  for (const option of allOptions) {
    program.addOption(new Option(getCommanderFlagsString(option), option.description).hideHelp());
  }
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  const outfile = typeof options['o'] === 'string' ? options['o'] : undefined;
  Logger.setVerbosity(parseInt(typeof options['loglevel'] === 'string' ? options['loglevel'] : '1', 10));
  const ba = readFile(infile);
  const recorder = new WaveRecorder();

  Logger.debug(`Processing ${infile}...`);

  try {
    if (!AdapterManager.encode(recorder, infile, ba, options)) {
      Logger.error(`Unable to decode ${infile}`);
      process.exit(1);
    }
  } catch (e) {
    if (e instanceof Exception.UsageError) {
      Logger.error(e.message);
      process.exit(1);
    } else {
      throw e; // show full stack trace for unexpected errors
    }
  }

  if (undefined === outfile) {
    // play
    const playerWrapper = await getPlayerWrapper(recorder);
    await playerWrapper.play(recorder.getRawBuffer());
    Logger.info('Finished.');
    process.exit(0);
  } else {
    // save
    writeFile(outfile, recorder.getBa());
    process.exit(0);
  }
}

function getCommanderFlagsString(optionDefinition: PublicOptionDefinition) {
  return optionDefinition.type !== 'text' || optionDefinition.argument === undefined ? `--${optionDefinition.name}` : `--${optionDefinition.name} <${optionDefinition.argument}>`;
}

async function getPlayerWrapper(recorder: WaveRecorder): Promise<PlayerWrapper> {
  for (const wrapper of playerWrapperPriority) {
    // eslint-disable-next-line no-await-in-loop
    const pw = await wrapper.create(recorder.sampleRate, recorder.bitsPerSample, recorder.channels);
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
