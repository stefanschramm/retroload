import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer, type PublicOptionDefinition} from '../../encoding/Options.js';

export type PublicConverterDefinition = {
  readonly name: string;
  readonly identifier: string;
  readonly options: PublicOptionDefinition[];
};

export type ConverterDefinition = PublicConverterDefinition & {
  readonly convert: (ba: BufferAccess, options: OptionContainer) => BufferAccess;
};
