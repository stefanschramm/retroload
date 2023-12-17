import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {type ArgumentOptionDefinition, type FlagOptionDefinition} from '../../Options.js';
import {MsxType, msxTypeList, type MsxTypeStrings} from './MsxDefinitions.js';

export const msxfastOption: FlagOptionDefinition = {
  name: 'msxfast',
  label: 'Fast baudrate',
  description: 'Use 2400 baud instead of 1200 (faster loading, less reliable)',
  type: 'bool',
  common: true,
};

export const msxTypeOption: ArgumentOptionDefinition<MsxType> = {
  name: 'msxtype',
  label: 'File type',
  description: `File type. Possible types: ${msxTypeList}`,
  argument: 'type',
  required: true,
  common: false,
  type: 'text',
  enum: Object.keys(MsxType),
  parse(v) {
    const vCasted = v as MsxTypeStrings;
    if (!Object.keys(MsxType).includes(vCasted)) {
      throw new InvalidArgumentError(msxTypeOption.name, `Option msxtype is required and expected to be one of the following values: ${msxTypeList}`);
    }

    return MsxType[vCasted];
  },
};
