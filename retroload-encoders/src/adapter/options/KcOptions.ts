import {InvalidArgumentError} from '../../Exceptions.js';
import {type ArgumentOptionDefinition} from '../../Options.js';

export const kcFirstBlockOption: ArgumentOptionDefinition<number> = {
  name: 'kcfirstblock',
  label: 'First block number',
  description: 'Number of first block for KC adapters. HC 900 and KC 85/2-4 use 1 while Z 9001, KC 85/1 and KC 87 use 0. Default: 1',
  argument: 'number',
  common: true,
  required: false,
  type: 'text',
  parse(v) {
    if (v === undefined || v === '') {
      return 1; // Defaults to 1 because most KCC files are for Muehlhausen KCs
    }
    const number = parseInt(v, 16);
    if (!isHexNumber(v) || isNaN(number) || number < 0 || number > 0xff) {
      throw new InvalidArgumentError(this.name, `Option ${this.name} is expected to be a 8-bit number in hexadecimal representation (0 to ff). Example: 0 or 1 (usual values)`);
    }

    return number;
  },
};

function isHexNumber(str: string) {
  return /^[A-Fa-f0-9]+$/.exec(str) !== null;
}
