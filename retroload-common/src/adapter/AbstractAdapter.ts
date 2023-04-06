import type {BufferAccess} from '../BufferAccess';
import type {Option} from '../Options';

export abstract class AbstractAdapter {
  static getTargetName: () => string;
  static getInternalName: () => string;
  static getName: () => string;
  static encode: (recorder, ba: BufferAccess, options: any) => void;
  static identify: (filename: string, ba: BufferAccess) => any;
  static getOptions(): Option[] {
    return [];
  }
}
