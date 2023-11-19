import {type FlagOptionDefinition} from '../../Options.js';

export const msxfastOption: FlagOptionDefinition = {
  name: 'msxfast',
  label: 'Fast baudrate',
  description: 'MSX: Use 2400 baud instead of 1200 (faster loading, less reliable)',
  type: 'bool',
  common: true,
};
