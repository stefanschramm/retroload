import {AbstractAdapter, type FormatIdentification} from './AbstractAdapter.js';
import type {BufferAccess} from '../BufferAccess.js';

export abstract class AbstractGenericAdapter extends AbstractAdapter {
  static override getName() {
    return 'Generic data';
  }

  static override getInternalName() {
    return 'generic';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return {
      // filename: filename.match(/^.*\.(bin|raw|txt|asc|atascii)$/i) !== null,
      filename: undefined,
      header: undefined,
    };
  }
}
