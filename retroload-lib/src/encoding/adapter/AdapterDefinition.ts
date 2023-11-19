
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer, type PublicOptionDefinition} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export type PublicAdapterDefinition = {
  readonly name: string;
  readonly internalName: string;
  readonly targetName: string;
  readonly options: PublicOptionDefinition[];
};

export type AdapterDefinition = PublicAdapterDefinition & {
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
