#!/usr/bin/env node

import {formatPosition, ConverterManager, Logger, version as libVersion} from 'retroload-lib';
import {Command, type OptionValues} from 'commander';
import {version as cliVersion} from './version.js';
import {readFile, writeFile} from './Utils.js';

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
    .name('retroload-dump')
    .description('Decode WAVE files of historical computers.')
    .argument('<infile>', 'Path to WAVE file to decode')
    .allowExcessArguments(false)
    .option('-o <outpath>', 'Prefix (filename or complete path) for files to write', './')
    .option('-l, --loglevel <loglevel>', 'Verbosity of log output', '1')
    .requiredOption('--to <outputtype>', `Output format (one of: ${getConverterList()})`)
    .option('--on-error <errorhandling>', 'Error handling strategy (one of: ignore, skipfile, stop)', 'ignore')
    .option('--channel <channel>', 'Use specified channel to get samples from, in case the input file has multiple channels. Numbering starts at 0.')
    .option('--skip <samples>', 'Start processing of input data after skipping a specific number of samples', '0')
    .option('--no-proposed-name', 'Just use numeric file names instead of file names from tape/archive.')
    .option('--extension <extension>', 'Use specified file extension instead of the one proposed by the converter.')
    .version(`retroload: ${cliVersion}\nretroload-lib: ${libVersion}`)
    .showHelpAfterError();
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  Logger.setVerbosity(parseInt(typeof options['loglevel'] === 'string' ? options['loglevel'] : '1', 10));
  const outputFormat = (typeof options['to'] === 'string' ? options['to'] : undefined);
  if (outputFormat === undefined) {
    // should actually be catched by commander because of requiredOption
    Logger.error('error: missing required argument \'to\'');
    process.exit(1);
  }
  const outPathPrefix = typeof options['o'] === 'string' ? options['o'] : './';
  const converterSettings = getConverterSettings(options);
  const ba = readFile(infile);

  Logger.debug(`Output format: ${outputFormat}`);
  Logger.debug(`Settings: ${JSON.stringify(converterSettings)}`);
  Logger.debug(`Processing ${infile}...`);

  let i = 0;
  for (const file of ConverterManager.convertWav(ba, outputFormat, converterSettings)) {
    const extension = typeof options['extension'] === 'string' ? options['extension'] : file.proposedExtension;
    const fallbackName = `${i}.${extension}`;
    const proposedName = file.proposedName === undefined ? fallbackName : `${file.proposedName}.${extension}`;
    const fileName = options['proposedName'] ? proposedName : fallbackName;
    Logger.info(`Writing file: ${fileName} (position in input: ${formatPosition(file.begin)} - ${formatPosition(file.end)})`);
    Logger.debug(file.data.asHexDump());
    writeFile(`${outPathPrefix}${fileName}`, file.data);
    i++;
  }
  Logger.info(`Dumped ${i} file(s).`);
}

function getConverterList(): string {
  return ConverterManager.getAllWriters().map((c) => c.to).join(', ');
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
