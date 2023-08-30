import {Z1013GenericAdapter} from './Z1013GenericAdapter.js';
import {type BufferAccess} from '../../common/BufferAccess.js';

export class Z1013Z13Adapter extends Z1013GenericAdapter {
  static override getName() {
    return 'Z1013 .Z13-File';
  }

  static override getInternalName() {
    return 'z13';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.z13$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }
}
