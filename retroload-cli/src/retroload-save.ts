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
  const files = decoder.decode(ba);
  Logger.debug(`Got ${files.length} files.`);
  let i = 0;
  for (const file of files) {
    Logger.debug('----------------');
    const fileHeader = '\xc3KC-TAPE by AF. ';
    const tapFile = BufferAccess.create(fileHeader.length + 129 * file.length);
    tapFile.writeAsciiString(fileHeader);
    for (const block of file) {
      tapFile.writeBa(block);
    }
    Logger.debug(tapFile.asHexDump());
    writeOutputFile(`${i}.tap`, tapFile.asUint8Array()); // TODO: Option for path/name(-prefix).
    i++;
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
