import type {BufferAccess} from '../../common/BufferAccess.js';
import {type OptionContainer, type OptionDefinition} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

export abstract class AbstractAdapter {
  static getTargetName: () => string;
  static getInternalName: () => string;
  static getName: () => string;
  static encode: (recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) => void;
  static identify: (filename: string, ba: BufferAccess) => FormatIdentification;
  static getOptions(): OptionDefinition[] {
    return [];
  }
}

export type FormatIdentification = {
  header: (boolean | undefined);
  filename: (boolean | undefined);
};

export const unidentifiable: FormatIdentification = {
  filename: undefined,
  header: undefined,
};
