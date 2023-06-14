#!/usr/bin/env node

import {BufferAccess} from 'retroload-common';
import {WaveRecorder, AdapterManager, Exception, Logger} from 'retroload-encoders';

import fs from 'fs';
import stream from 'stream';
import {Command} from 'commander';
import {type OptionDefinition} from 'retroload-encoders/dist/cjs/Options.js';
import type Speaker from 'speaker';

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
  const speaker = playback ? await initializeSpeaker() : null;
  const data = readInputFile(infile);
  const recorder = new WaveRecorder();
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
    if (speaker === null) {
      Logger.error('Speaker module not found.');
      process.exit(1);
    }
    await play(speaker, recorder.getRawBuffer());
    process.exit(0);
  } else {
    writeOutputFile(outfile, recorder.getBuffer());
    process.exit(0);
  }
}

function getCommanderFlagsString(optionDefinition: OptionDefinition) {
  return optionDefinition.type !== 'text' || optionDefinition.argument === undefined ? `--${optionDefinition.name}` : `--${optionDefinition.name} <${optionDefinition.argument}>`;
}

async function initializeSpeaker() {
  try {
    // Dynamically try to load speaker module.
    // This way it doesn't need to be an actual dependency.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Speaker = (await import('speaker')).default;
    return new Speaker({
      channels: 1,
      bitDepth: 8,
      sampleRate: 44100,
    });
  } catch (e: any) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Unable to load speaker module. Install it using "npm install speaker". You may need to install additional system packages like build-essential and libasound2-dev. Alternatively, if you wish to generate a WAVE file, please specify the output file using the -o option.');
    } else {
      console.error(e);
    }
    process.exit(1);
  }
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

async function play(speaker: Speaker, buffer: Uint8Array) {
  return new Promise((resolve) => {
    Logger.info('Playing...');
    const s = new stream.PassThrough();
    s.push(buffer);
    s.push(null);
    speaker.on('finish', () => {
      Logger.info('Finished.');
      resolve(null);
    });
    s.pipe(speaker);
  });
}
