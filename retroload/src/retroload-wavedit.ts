#!/usr/bin/env node

import {Command} from 'commander';
import {Editor} from './editor/Editor.js';
import {WavFile} from './editor/WavFile.js';

function main() {
  const program = (new Command())
    .name('retroload-wavedit')
    .description('Semi-visually edit individual samples in WAV files.')
    .argument('<infile>', 'Path to WAV file to edit')
    .option('-g <sample>', 'Directly jump to specified sample')
    .option('-c <channel>', 'Select channel', '0');
  program.parse();
  const options = program.opts();
  const infile = program.args[0];
  const channel = parseInt(typeof options['c'] === 'string' ? options['c'] : '0', 10);
  const goTo = typeof options['g'] === 'string' ? parseInt(options['g'], 10) : undefined;
  const file = new WavFile(infile, channel);

  (new Editor(file)).run(goTo);
}

main();
