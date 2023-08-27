#!/usr/bin/env node

import {BufferAccess} from 'retroload-common';
import {ConverterManager, Logger} from 'retroload-encoders';
import fs from 'fs';
import {Command} from 'commander';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  /*
TODO:
- arguments
   input formats (can be autodetected):
   --from wav
   --from csw

   output formats:
   --to kctap
   --to kcsss

  output path/filename/prefix:
  -o output_dir/prefix
  --no-proposed-name = number files instead of trying to use record names

  error handling:
  --on-error stop = cancel processing, output error position (default)
  --on-error skipfile = ignore whole file
  --on-error skipblock = ignore block, continue with next block
  --on-error zerofill = fill block with zeros
  --on-error partial = write partial block

- statistics
  - total files
  - invalid blocks
  - invalid files
- (ASCII-)visualize wave on error (at --on-error stop)
  */
  const program = (new Command())
    .name('retroload-save')
    .description('Decode WAVE files of historical computers.')
    .argument('<infile>', 'Path to WAVE file to analyze')
    .allowExcessArguments(false)
    .option('-v, --verbosity <verbosity>', 'Verbosity of log output', '1')
    .option('--to <outputtype>', 'Output format');
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  Logger.setVerbosity(parseInt(typeof options['verbosity'] === 'string' ? options['verbosity'] : '1', 10));
  const outputFormat = (typeof options['to'] === 'string' ? options['to'] : undefined);
  if (outputFormat === undefined) {
    Logger.error('error: missing required argument \'to\'');
    return;
  }
  const data = readInputFile(infile);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  const ba = new BufferAccess(arrayBuffer);
  Logger.debug(`Output format: ${outputFormat}`);
  Logger.debug(`Processing ${infile}...`);
  const files = ConverterManager.convert(ba, 'wav', outputFormat, {onError: 'partial'}); // TODO: settings as arguments
  Logger.debug(`Got ${files.length} files.`);
  let i = 0;
  for (const file of files) {
    Logger.info(file.proposedName ?? '');
    Logger.debug(file.data.asHexDump());
    writeOutputFile(`${i}.tap`, file.data.asUint8Array()); // TODO: Option for path/name(-prefix).
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
