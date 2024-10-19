import {type ArgumentOptionDefinition} from '../../Options.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';

export enum C64MachineType {
  c64pal = 'c64pal',
  c64ntsc = 'c64ntsc',
  vic20pal = 'vic20pal',
  vic20ntsc = 'vic20ntsc',
}
const c64MachineTypeDefault = C64MachineType.c64pal;
type C64MachineTypeString = keyof typeof C64MachineType;
const c64MachineTypeList = Object.keys(C64MachineType).join(', ');

export const c64machineOption: ArgumentOptionDefinition<C64MachineType> = {
  name: 'c64machine',
  label: 'Machine',
  description: `Machine type. Possible types: ${c64MachineTypeList}. Default: ${c64MachineTypeDefault}`,
  argument: 'machine',
  required: false,
  common: true,
  type: 'text',
  enum: Object.keys(C64MachineType),
  parse(v) {
    if (v === '') {
      return c64MachineTypeDefault;
    }
    const vCasted = v as C64MachineTypeString;
    if (Object.keys(C64MachineType).includes(vCasted)) {
      return C64MachineType[vCasted];
    }

    throw new InvalidArgumentError('c64machine', `Option c64machine is expected to be one of the following values: ${c64MachineTypeList}`);
  },
};
