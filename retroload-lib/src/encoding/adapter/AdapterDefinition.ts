
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer, type OptionDefinition} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export type AdapterDefinition = {
  readonly label: string;
  readonly name: string;
  readonly options: OptionDefinition[];
};

export type InternalAdapterDefinition = AdapterDefinition & {
  readonly identify: (filename: string, ba: BufferAccess) => FormatIdentification;
  readonly encode: (recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) => void;
};

export type FormatIdentification = {
  header: (boolean | undefined);
  filename: (boolean | undefined);
};

export const unidentifiable: FormatIdentification = {
  filename: undefined,
  header: undefined,
};
