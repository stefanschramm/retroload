#!/usr/bin/env node

import {ConverterManager, Exception, Logger, version as libVersion} from 'retroload-lib';
import {Command} from 'commander';
import {version as cliVersion} from './version.js';
import {readFile, writeFile} from './Utils.js';

main()
  .catch((err) => {
    Logger.error(err as string);
  });

async function main() {
  // const formatNames = AdapterManager.getAllAdapters().map((a) => a.internalName);
  // formatNames.sort();
  const program = (new Command())
    .name('retroload-convert')
    .description('Convert raw data into tape archive formats. (EXPERIMENTAL!)')
    .argument('infile', 'Path to file to convert')
    .allowExcessArguments(false)
    .option('-o <outfile>', 'Path to file to write')
    .option('-f <format>', 'Name of format to create')
    .option('-l, --loglevel <loglevel>', 'Verbosity of log output', '1')
    .version(`retroload: ${cliVersion}\nretroload-lib: ${libVersion}`)
    .showHelpAfterError();
  // Options defined in adapters/encoders

  /*
  const allOptions = AdapterManager.getAllOptions();
  allOptions.sort((a, b) => a.common && !b.common ? -1 : 0);
  for (const option of allOptions) {
    program.addOption(new Option(getCommanderFlagsString(option), option.description).hideHelp());
  }
  */
  program.parse();

  const options = program.opts();
  const infile = program.args[0];
  const outfile = options['o'] as string; // TODO: fix type stuff; let converter propose new filename ((input.bin).cas)?
  Logger.setVerbosity(parseInt(typeof options['loglevel'] === 'string' ? options['loglevel'] : '1', 10));
  const inputBa = readFile(infile);
  const format: string = options['f'] as string; // TODO: fix type stuff

  Logger.debug(`Processing ${infile}...`);

  try {
    const outputBa = ConverterManager.convert(inputBa, format, options);
    writeFile(outfile, outputBa);
  } catch (e) {
    if (e instanceof Exception.UsageError) {
      Logger.error(e.message);
      process.exit(1);
    } else {
      throw e; // show full stack trace for unexpected errors
    }
  }
}

/*
function getCommanderFlagsString(optionDefinition: PublicOptionDefinition) {
  return optionDefinition.type !== 'text' || optionDefinition.argument === undefined ? `--${optionDefinition.name}` : `--${optionDefinition.name} <${optionDefinition.argument}>`;
}
*/
