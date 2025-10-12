import {type ArgumentOptionDefinition} from '../../Options.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';

export const kcFirstBlockOption: ArgumentOptionDefinition<number> = {
  name: 'firstblock',
  label: 'First block number',
  description: 'Number of first block. HC 900 and KC 85/2-4 use 1 while Z 9001, KC 85/1 and KC 87 use 0. Default: 1',
  argument: 'number',
  common: true,
  required: false,
  type: 'text',
  parse(v) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

function isHexNumber(str: string): boolean {
  // eslint-disable-next-line require-unicode-regexp
  return (/^[A-Fa-f0-9]+$/).exec(str) !== null;
}
