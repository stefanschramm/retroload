#!/usr/bin/env node

import {BufferAccess} from 'retroload-lib';
import {WaveRecorder, AdapterManager, Exception, Logger} from 'retroload-lib';
import fs from 'fs';
import {Command} from 'commander';
import {type OptionDefinition} from 'retroload-lib';
import {SpeakerWrapper} from './SpeakerWrapper.js';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  const machineFormatList = AdapterManager.getAllAdapters().map((a) => a.getTargetName() + '/' + a.getInternalName()).join(', ');
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
  const playback = undefined === outfile;
  const data = readInputFile(infile);
  const recorder = new WaveRecorder();
  const speakerWrapper = playback ? (await SpeakerWrapper.create(recorder.sampleRate, recorder.bitsPerSample, recorder.channels)) : undefined;
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  const ba = new BufferAccess(arrayBuffer);

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
      throw e;
    }
  }

  if (playback) {
    if (speakerWrapper === undefined) {
      Logger.error('Speaker module not found.');
      process.exit(1);
    }
    await speakerWrapper.play(recorder.getRawBuffer());
    process.exit(0);
  } else {
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
    console.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

function writeOutputFile(path: string, data: Uint8Array) {
  try {
    fs.writeFileSync(path, data);
  } catch {
    console.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
}

