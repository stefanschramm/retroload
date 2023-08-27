import {type ConverterDefinition} from './ConverterManager.js';
import {wav2KcTapConverter} from './kc/Wav2KcTapConverter.js';

export const converters: ConverterDefinition[] = [
  wav2KcTapConverter,
];
