#!/usr/bin/env node

import {BufferAccess} from 'retroload-lib';
import {ConverterManager, Logger} from 'retroload-lib';
import fs from 'fs';
import {Command, type OptionValues} from 'commander';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  // TODO / Nice to haves:
  // - CSW as additional input format
  // - kcsss (and many others) as additional output format
  // - option to fix block number on read errors
  // - additional statistics: total block count, invalid files/blocks
  // - visualize WAVE samples of section around error as ASCII graph when --on-error was set to 'stop'
  const program = (new Command())
    .name('retroload-save')
    .description('Decode WAVE files of historical computers.')
    .argument('<infile>', 'Path to WAVE file to decode')
    .allowExcessArguments(false)
    .option('-o <outpath>', 'Prefix (filename or complete path) for files to write', './')
    .option('-v, --verbosity <verbosity>', 'Verbosity of log output', '1')
    .option('--to <outputtype>', 'Output format') // TODO: list possible formats
    .option('--on-error <errorhandling>', 'Error handling strategy (one of: ignore, skipfile, stop)', 'ignore')
    .option('--channel <channel>', 'Use specified channel to get samples from, in case the input file has multiple channels. Numbering starts at 0.')
    .option('--skip <samples>', 'Start processing of input data after skipping a specific number of samples', '0')
    .option('--no-proposed-name', 'Just use numeric file names instead of file names from tape/archive.')
    .option('--extension <extension>', 'Use specified file extension instead of the one proposed by the converter.');
  program.exitOverride((err) => {
    if (err.code === 'commander.missingArgument') {
      program.outputHelp();
    }
    process.exit(err.exitCode);
  });
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  Logger.setVerbosity(parseInt(typeof options['verbosity'] === 'string' ? options['verbosity'] : '1', 10));
  const outputFormat = (typeof options['to'] === 'string' ? options['to'] : undefined);
  if (outputFormat === undefined) {
    Logger.error('error: missing required argument \'to\'');
    process.exit(1);
  }
  const outPathPrefix = typeof options['o'] === 'string' ? options['o'] : './';
  const converterSettings = getConverterSettings(options);
  const buffer = readInputFile(infile);
  const ba = BufferAccess.createFromNodeBuffer(buffer);
  Logger.debug(`Output format: ${outputFormat}`);
  Logger.debug(`Settings: ${JSON.stringify(converterSettings)}`);
  Logger.debug(`Processing ${infile}...`);
  let i = 0;
  for (const file of ConverterManager.convert(ba, 'wav', outputFormat, converterSettings)) {
    const extension = typeof options['extension'] === 'string' ? options['extension'] : file.proposedExtension;
    const fallbackName = `${i}.${extension}`;
    const proposedName = file.proposedName === undefined ? fallbackName : `${file.proposedName}.${extension}`;
    const fileName = options['proposedName'] ? proposedName : fallbackName;
    Logger.info(`Writing file: ${fileName}`);
    Logger.debug(file.data.asHexDump());
    writeOutputFile(`${outPathPrefix}${fileName}`, file.data.asUint8Array());
    i++;
  }
  Logger.info(`Dumped ${i} file(s).`);
}

function getConverterSettings(options: OptionValues): ConverterManager.ConverterSettings {
  if (typeof options['onError'] !== 'string') {
    Logger.error('error: invalid value for argument \'on-error\'');
    process.exit(1);
  }
  if (options['onError'] !== 'stop' && options['onError'] !== 'ignore' && options['onError'] !== 'skipfile') {
    Logger.error('error: invalid value for argument \'on-error\'');
    process.exit(1);
  }

  return {
    onError: options['onError'],
    skip: parseInt(typeof options['skip'] === 'string' ? options['skip'] : '0', 10),
    channel: typeof options['channel'] === 'string' ? parseInt(options['channel'], 10) : undefined,
  };
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
