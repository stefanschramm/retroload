import {type ArgumentOptionDefinition, parse8BitIntegerOption} from '../../Options.js';

export const kcFirstBlockOption: ArgumentOptionDefinition<number> = {
  name: 'firstblock',
  label: 'First block number',
  description: 'Number of first block. HC 900 and KC 85/2-4 use 1 while Z 9001, KC 85/1 and KC 87 use 0. Default: 1',
  argument: 'number',
  common: true,
  required: false,
  type: 'text',
  parse: function parse(v) {
    // Defaults to 1 because most KCC files are for Muehlhausen KCs
    return parse8BitIntegerOption(v, this.name) ?? 1;
  },
};
