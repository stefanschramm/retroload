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
    .argument('infile', 'Path to WAVE file to analyze')
    .allowExcessArguments(false);
  const infile = program.args[0];
  const data = readInputFile(infile);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  const ba = new BufferAccess(arrayBuffer);
  Logger.debug(`Processing ${infile}...`);
  Logger.debug(ba.asHexDump());

  const decoder = new KcDecoder();
  decoder.decode();
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