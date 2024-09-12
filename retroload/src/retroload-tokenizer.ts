#!/usr/bin/env node

import fs from 'fs';
import {Command} from 'commander';
import {BasicTokenizers, type TokenizerDefinition} from 'retroload-lib';

function main(): void {
  const program = (new Command())
    .name('retroload-tokenizer')
    .description('Convert plain text BASIC files into tokenized BASIC files for loading.')
    .argument('<infile>', 'Path to source file to tokenize')
    .option('-d, --dialect <basic dialect>', 'BASIC dialect to use')
    .option('-o, --outfile <output file>', 'Where to write to binary output to. By default the input filename with a dialect specific extension is used as output filename.');
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  const dialect = typeof options['dialect'] === 'string' ? options['dialect'] : 'kc';

  const tokenizer = getTokenizerByDialectName(dialect);

  const outfile = typeof options['outfile'] === 'string' ? options['outfile'] : `${infile}.${tokenizer.extension}`;

  const destinationBa = tokenizer.tokenize(fs.readFileSync(infile).toString());
  fs.writeFileSync(outfile, destinationBa.asUint8Array());
}

function getTokenizerByDialectName(name: string): TokenizerDefinition {
  const result = BasicTokenizers.filter((t) => t.name === name);

  if (result.length === 0) {
    const avaliableDialectNames = BasicTokenizers.map((t) => t.name);
    console.error(`Tokenizer for BASIC dialect "${name}" not found. Available dialects: ${avaliableDialectNames.join(', ')}`);
    process.exit(1);
  }
  if (result.length > 1) {
    throw new Error(`Found multiple BASIC tokenizers with name "${name}".`);
  }

  return result[0];
}

main();
