#!/usr/bin/env node

import {BufferAccess} from 'retroload-common';
import {KcDecoder, Logger} from 'retroload-encoders';
import fs from 'fs';
import {Command} from 'commander';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  const program = (new Command())
    .name('retroload-save')
    .description('Decode WAVE files of historical computers.')
    .argument('<infile>', 'Path to WAVE file to analyze')
    .allowExcessArguments(false)
    .option('-v, --verbosity <verbosity>', 'Verbosity of log output', '1');
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  Logger.setVerbosity(parseInt(typeof options['verbosity'] === 'string' ? options['verbosity'] : '1', 10));
  const data = readInputFile(infile);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  const ba = new BufferAccess(arrayBuffer);
  Logger.debug(`Processing ${infile}...`);
  const decoder = new KcDecoder();
  decoder.decode(ba);
}

function readInputFile(path: string) {
  try {
    return fs.readFileSync(path);
  } catch {
    console.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

/*
function writeOutputFile(path: string, data: Uint8Array) {
  try {
    fs.writeFileSync(path, data);
  } catch {
    console.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
}
*/