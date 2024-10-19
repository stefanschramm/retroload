#!/usr/bin/env node

import {Command, type OptionValues} from 'commander';
import {type DecoderSettings, Logger, decodeWav, formatPosition, getAllDecoders, version as libVersion} from 'retroload-lib';
import {readFile, writeFile} from './Utils.js';
import {version as cliVersion} from './version.js';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

// eslint-disable-next-line require-await
async function main(): Promise<void> {
  // TODO / Nice to haves:
  // - CSW as additional input format
  // - kcsss (and many others) as additional output format
  // - option to fix block number on read errors
  // - additional statistics: total block count, invalid files/blocks
  // - visualize WAVE samples of section around error as ASCII graph when --on-error was set to 'stop'
  const program = (new Command())
    .name('retroload-decode')
    .description('Decode WAVE files of historical computers.')
    .argument('<infile>', 'Path to WAVE file to decode')
    .allowExcessArguments(false)
    .option('-o <outpath>', 'Prefix (filename or complete path) for files to write', './')
    .option('-l, --loglevel <loglevel>', 'Verbosity of log output', '1')
    .requiredOption('--format <format>', `Output format (one of: ${getDecoderList()})`)
    .option('--on-error <errorhandling>', 'Error handling strategy (one of: ignore, skipfile, stop)', 'ignore')
    .option('--channel <channel>', 'Use specified channel to get samples from, in case the input file has multiple channels. Numbering starts at 0.')
    .option('--skip <samples>', 'Start processing of input data after skipping a specific number of samples', '0')
    .option('--no-proposed-name', 'Just use numeric file names instead of file names from tape/archive.')
    .option('--extension <extension>', 'Use specified file extension instead of the one proposed by the decoder.')
    .version(`retroload: ${cliVersion}\nretroload-lib: ${libVersion}`)
    .showHelpAfterError();
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  Logger.setVerbosity(parseInt(typeof options['loglevel'] === 'string' ? options['loglevel'] : '1', 10));
  const outputFormat = (typeof options['format'] === 'string' ? options['format'] : undefined);
  if (outputFormat === undefined) {
    // should actually be catched by commander because of requiredOption
    Logger.error('error: missing required argument \'format\'');
    process.exit(1);
  }
  const outPathPrefix = typeof options['o'] === 'string' ? options['o'] : './';
  const decoderSettings = getDecoderSettings(options);
  const data = readFile(infile);

  Logger.debug(`Output format: ${outputFormat}`);
  Logger.debug(`Settings: ${JSON.stringify(decoderSettings)}`);
  Logger.debug(`Processing ${infile}...`);

  let i = 0;
  for (const file of decodeWav(data, outputFormat, decoderSettings)) {
    const extension = typeof options['extension'] === 'string' ? options['extension'] : file.proposedExtension;
    const fallbackName = `${i}.${extension}`;
    const proposedName = file.proposedName === undefined ? fallbackName : `${file.proposedName}.${extension}`;
    const fileName = options['proposedName'] ? proposedName : fallbackName;
    Logger.info(`Writing file: ${fileName} (${file.data.length()} bytes, position in input: ${formatPosition(file.begin)} - ${formatPosition(file.end)})`);
    Logger.debug(file.data.asHexDump());
    writeFile(`${outPathPrefix}${fileName}`, file.data.asUint8Array());
    i++;
  }
  Logger.info(`Dumped ${i} file(s).`);
}

function getDecoderList(): string {
  return getAllDecoders().map((c) => c.format).join(', ');
}

function getDecoderSettings(options: OptionValues): DecoderSettings {
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
