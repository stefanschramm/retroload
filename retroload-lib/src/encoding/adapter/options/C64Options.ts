import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {type ArgumentOptionDefinition} from '../../Options.js';

export enum C64MachineType {
  c64pal = 'c64pal',
  c64ntsc = 'c64ntsc',
  vic20pal = 'vic20pal',
  vic20ntsc = 'vic20ntsc',
}

type C64MachineTypeStrings = keyof typeof C64MachineType;

export const c64machineOption: ArgumentOptionDefinition<C64MachineType> = {
  name: 'c64machine',
  label: 'Machine',
  description: 'C64: Machine type. Possible types: c64pal, c64ntsc, vic20pal, vic20ntsc. Default: c64pal',
  argument: 'machine',
  required: false,
  common: true,
  type: 'text',
  enum: Object.keys(C64MachineType),
  parse(v) {
    if (v === '') {
      return C64MachineType.c64pal;
    }
    const vCasted = v as C64MachineTypeStrings;
    if (Object.keys(C64MachineType).includes(vCasted)) {
      return C64MachineType[vCasted];
    }

    throw new InvalidArgumentError('c64machine', `Option c64machine is expected to be one of the following values: ${Object.keys(C64MachineType).join(', ')}`);
  },
};
