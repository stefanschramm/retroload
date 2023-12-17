import {type BufferAccess} from '../common/BufferAccess.js';
import {FormatNotFoundError} from '../common/Exceptions.js';
import {OptionContainer, type OptionValues} from '../encoding/Options.js';
import {converters} from './ConverterProvider.js';
import {type ConverterDefinition} from './converter/ConverterDefinition.js';

export function convert(data: BufferAccess, identifier: string, options: OptionValues): BufferAccess {
  const chosenConverters = converters.filter((c: ConverterDefinition) => c.identifier === identifier);

  if (chosenConverters.length === 0) {
    throw new FormatNotFoundError(identifier);
  }

  const converter = chosenConverters[0];

  return converter.convert(data, new OptionContainer(options));
}
