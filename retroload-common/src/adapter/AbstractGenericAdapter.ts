import {AbstractAdapter} from './AbstractAdapter.js';
import type {BufferAccess} from '../BufferAccess.js';

export abstract class AbstractGenericAdapter extends AbstractAdapter {
  static override getName() {
    return 'Generic data';
  }

  static override getInternalName() {
    return 'generic';
  }

  static override identify(filename: string, ba: BufferAccess): any {
    return {
      // filename: filename.match(/^.*\.(bin|raw|txt|asc|atascii)$/i) !== null,
      filename: undefined,
      header: undefined,
    };
  }
}
