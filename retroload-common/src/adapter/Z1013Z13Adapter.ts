import {Z1013GenericAdapter} from './Z1013GenericAdapter.js';
import type {BufferAccess} from '../BufferAccess.js';

export class Z1013Z13Adapter extends Z1013GenericAdapter {
  static getName() {
    return 'Z1013 .Z13-File';
  }

  static getInternalName() {
    return 'z1013z13';
  }

  static identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.z13$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }
}
