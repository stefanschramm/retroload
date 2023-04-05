import {AbstractAdapter} from './AbstractAdapter.js';
import {BufferAccess} from '../BufferAccess.js';

export abstract class AbstractGenericAdapter extends AbstractAdapter {
  static getName() {
    return 'Generic data';
  }

  static getInternalName() {
    return 'generic';
  }

  static identify(filename: string, ba: BufferAccess): any {
    return {
      // filename: filename.match(/^.*\.(bin|raw|txt|asc|atascii)$/i) !== null,
      filename: undefined,
      header: undefined,
    };
  }
}
