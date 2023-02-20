#!/usr/bin/env node

import fs from 'fs';
import {SourceTokenizer} from './tokenizer.js';

function main() {
  const t = new SourceTokenizer();
  const destinationBa = t.tokenize(fs.readFileSync('test.txt').toString());
  fs.writeFileSync('out.bin', destinationBa.asUint8Array());
}

main();
