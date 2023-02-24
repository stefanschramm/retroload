#!/usr/bin/env node

import fs from 'fs';
import {Command} from 'commander';
import {InternalError} from 'retroload-common/src/Exceptions.js';
import {BasicTokenizers, Logger} from 'retroload-common';

function main() {
  const program = (new Command())
      .name('retroload-tokenizer')
      .description('Convert plain text BASIC files into tokenized BASIC files for loading.')
      .argument('<infile>', 'Path to source file to tokenize')
      .option('-d, --dialect <basic dialect>', 'BASIC dialect to use')
      .option('-o, --outfile <output file>', 'Where to write to binary output to. By default the input filename with a dialect specific extension is used as output filename.')
  ;
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  const dialect = options.dialect || 'kc';

  const tokenizer = getTokenizerByDialectName(dialect);

  const outfile = options.outfile || `${infile}.${tokenizer.getExtension()}`;

  const destinationBa = tokenizer.tokenize(fs.readFileSync(infile).toString());
  fs.writeFileSync(outfile, destinationBa.asUint8Array());
}

function getTokenizerByDialectName(name) {
  const result = BasicTokenizers.filter((t) => t.getName() === name);

  if (result.length === 0) {
    const avaliableDialectNames = BasicTokenizers.map((t) => t.getName());
    Logger.error(`Tokenizer for BASIC dialect "${name}" not found. Available dialects: ${avaliableDialectNames.join(', ')}`);
    process.exit(1);
  }
  if (result.length > 1) {
    throw new InternalError(`Found multiple BASIC tokenizers with name "${name}".`);
  }

  return result[0];
}

main();
