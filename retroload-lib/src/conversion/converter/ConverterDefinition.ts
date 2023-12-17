import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer, type PublicOptionDefinition} from '../../encoding/Options.js';

export type ConverterDefinition = {
  readonly name: string;
  readonly identifier: string;
  readonly options: PublicOptionDefinition[];
  readonly convert: (ba: BufferAccess, options: OptionContainer) => BufferAccess;
};
