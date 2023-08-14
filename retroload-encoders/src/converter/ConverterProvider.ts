import {type ConverterDefinition} from './ConverterManager.js';
import {wav2KcTapConverter} from './Wav2KcTapConverter.js';

export const converters: ConverterDefinition[] = [
  wav2KcTapConverter,
];
