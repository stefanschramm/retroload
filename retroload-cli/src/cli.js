#!/usr/bin/env node

import {WaveRecorder, AdapterManager, Exception, Logger} from 'retroload-common';

import fs from 'fs';
import stream from 'stream';
import {Command} from 'commander';

main();

async function main() {
  const program = (new Command())
      .name('retroload')
      .description('Play 8 bit homecomputer tape images or convert them to WAVE files.')
      .argument('infile', 'Path to file to play (default) or convert (when using -o <outfile> option)')
      .allowExcessArguments(false)
      .option('-o <outfile>', 'Generate WAVE file <outfile> instead of playback')
      .option('-f, --format <format>', 'Format of input file (required when automatic format detection by content and filename fails)')
      .option('-m, --machine <machine type>', 'Machine type to load data onto (required for some formats that can be used for several machines)')
      .option('-v, --verbosity <verbosity>', 'Verbosity of log output', 1)
  ;
  // Options defined in adapters/encoders
  const allOptions = AdapterManager.getAllOptions();
  allOptions.sort((a, b) => a.common && !b.common ? -1 : 0);
  for (const option of allOptions) {
    program.option(option.getCommanderFlagsString(), option.description, option.defaultValue);
  }
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  const outfile = options.o;
  Logger.setVerbosity(parseInt(options.verbosity));
  const playback = undefined === outfile;
  const speaker = playback ? await initializeSpeaker() : null;
  const data = readInputFile(infile);
  const recorder = new WaveRecorder();
  const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
  );

  Logger.debug(`Processing ${infile}...`);

  try {
    if (!AdapterManager.encode(recorder, infile, arrayBuffer, options)) {
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
    await play(speaker, recorder.getRawBuffer());
    process.exit(0);
  } else {
    writeOutputFile(outfile, recorder.getBuffer());
    process.exit(0);
  }
}

async function initializeSpeaker() {
  try {
    // Dynamically try to load speaker module.
    // This way it doesn't need to be an actual dependency.
    const Speaker = (await import('speaker')).default;
    return new Speaker({
      channels: 1,
      bitDepth: 8,
      sampleRate: 44100,
    });
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Unable to load speaker module. Install it using "npm install speaker". You may need to install additional system packages like build-essential and libasound2-dev. Alternatively, if you wish to generate a WAVE file, please specify the output file using the -o option.');
    } else {
      console.error(e);
    }
    process.exit(1);
  }
}

function readInputFile(path) {
  try {
    return fs.readFileSync(path);
  } catch {
    console.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

function writeOutputFile(path, data) {
  try {
    fs.writeFileSync(path, data);
  } catch {
    console.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
}

async function play(speaker, buffer) {
  return new Promise((resolve) => {
    Logger.info('Playing...');
    const s = new stream.PassThrough();
    s.push(buffer);
    s.push(null);
    speaker.on('finish', () => {
      Logger.info('Finished.');
      resolve();
    });
    s.pipe(speaker);
  });
}
