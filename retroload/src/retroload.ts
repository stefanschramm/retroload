#!/usr/bin/env node

import {BufferAccess} from 'retroload-lib';
import {WaveRecorder, AdapterManager, Exception, Logger} from 'retroload-lib';
import fs from 'fs';
import {Command} from 'commander';
import {type OptionDefinition} from 'retroload-lib';
import {SpeakerWrapper} from './player/SpeakerWrapper.js';
import {AplayWrapper} from './player/AplayWrapper.js';
import {type PlayerWrapper} from './player/PlayerWrapper.js';
import {SoxWrapper} from './player/SoxWrapper.js';

const playerWrapperPriority = [
  SoxWrapper,
  AplayWrapper,
  SpeakerWrapper,
];

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  const machineFormatList = AdapterManager.getAllAdapters().map((a) => a.targetName + '/' + a.internalName).join(', ');
  const program = (new Command())
    .name('retroload')
    .description('Play 8 bit homecomputer tape images or convert them to WAVE files.')
    .argument('infile', 'Path to file to play (default) or convert (when using -o <outfile> option)')
    .allowExcessArguments(false)
    .option('-o <outfile>', 'Generate WAVE file <outfile> instead of playback')
    .option('-f, ' + getCommanderFlagsString(AdapterManager.formatOption), AdapterManager.formatOption.description)
    .option('-m, ' + getCommanderFlagsString(AdapterManager.machineOption), AdapterManager.machineOption.description)
    .option('-v, --verbosity <verbosity>', 'Verbosity of log output', '1')
    .addHelpText('after', `\nAvailable machine/format combinations: ${machineFormatList}`);
  // Options defined in adapters/encoders
  const allOptions = AdapterManager.getAllOptions();
  allOptions.sort((a, b) => a.common && !b.common ? -1 : 0);
  for (const option of allOptions) {
    program.option(getCommanderFlagsString(option), option.description);
  }
  program.exitOverride((err) => {
    if (err.code === 'commander.missingArgument') {
      program.outputHelp();
    }
    process.exit(err.exitCode);
  });
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  const outfile = typeof options['o'] === 'string' ? options['o'] : undefined;
  Logger.setVerbosity(parseInt(typeof options['verbosity'] === 'string' ? options['verbosity'] : '1', 10));
  const buffer = readInputFile(infile);
  const recorder = new WaveRecorder();
  const ba = BufferAccess.createFromNodeBuffer(buffer);

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
    writeOutputFile(outfile, recorder.getBuffer());
    process.exit(0);
  }
}

function getCommanderFlagsString(optionDefinition: OptionDefinition) {
  return optionDefinition.type !== 'text' || optionDefinition.argument === undefined ? `--${optionDefinition.name}` : `--${optionDefinition.name} <${optionDefinition.argument}>`;
}

function readInputFile(path: string) {
  try {
    return fs.readFileSync(path);
  } catch {
    Logger.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

function writeOutputFile(path: string, data: Uint8Array) {
  try {
    fs.writeFileSync(path, data);
  } catch {
    Logger.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
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
