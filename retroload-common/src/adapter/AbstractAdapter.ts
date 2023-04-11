import type {BufferAccess} from '../BufferAccess';
import type {Option} from '../Options';
import {type RecorderInterface} from '../recorder/RecorderInterface';

export abstract class AbstractAdapter {
  static getTargetName: () => string;
  static getInternalName: () => string;
  static getName: () => string;
  static encode: (recorder: RecorderInterface, ba: BufferAccess, options: any) => void;
  static identify: (filename: string, ba: BufferAccess) => FormatIdentification;
  static getOptions(): Option[] {
    return [];
  }
}

export type FormatIdentification = {
  header: (boolean | undefined);
  filename: (boolean | undefined);
};
