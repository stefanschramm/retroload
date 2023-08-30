
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type OptionDefinition, type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export type AdapterDefinition = {
  readonly name: string;
  readonly internalName: string;
  readonly targetName: string;
  readonly options: OptionDefinition[];
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
