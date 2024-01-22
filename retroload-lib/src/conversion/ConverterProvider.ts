import {type ConverterDefinition} from './converter/ConverterDefinition.js';
import AtariCasConverter from './converter/AtariCasConverter.js';
import KcTapConverter from './converter/KcTapConverter.js';

export const converters: ConverterDefinition[] = [
  AtariCasConverter,
  KcTapConverter,
];
