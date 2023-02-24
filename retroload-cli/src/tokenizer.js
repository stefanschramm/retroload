#!/usr/bin/env node

import fs from 'fs';
import {Command} from 'commander';
import {DIALECTS} from './tokenizer.js';

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

  if (DIALECTS[dialect] === undefined) {
    throw new Error(`Unknown dialect: "${dialect}"`);
  }

  const outfile = options.outfile || `${infile}.${DIALECTS[dialect].extension}`;

  const destinationBa = DIALECTS[dialect].tokenize(fs.readFileSync(infile).toString());
  fs.writeFileSync(outfile, destinationBa.asUint8Array());
}

main();
