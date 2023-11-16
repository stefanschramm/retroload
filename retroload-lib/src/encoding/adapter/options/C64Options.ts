import {type ArgumentOptionDefinition} from '../../Options.js';

const c64machineTypes: C64MachineType[] = ['c64pal', 'c64ntsc', 'vic20pal', 'vic20ntsc'];

export const c64machineOption: ArgumentOptionDefinition<string> = {
  name: 'c64machine',
  label: 'Machine',
  description: 'C64: Machine type. Possible types: c64pal, c64ntsc, vic20pal, vic20ntsc. Default: c64pal',
  argument: 'machine',
  required: false,
  common: true,
  type: 'text',
  enum: c64machineTypes,
  parse: (v) => v === '' ? 'c64pal' : v,
};

export type C64MachineType = 'c64pal' | 'c64ntsc' | 'vic20pal' | 'vic20ntsc';
