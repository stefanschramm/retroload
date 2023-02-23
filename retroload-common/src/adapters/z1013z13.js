import {Z1013GenericAdapter} from './z1013generic.js';

export class Z1013Z13Adapter extends Z1013GenericAdapter {
  static getName() {
    return 'Z1013 .Z13-File';
  }

  static getInternalName() {
    return 'z1013z13';
  }

  static identify(filename, ba) {
    return {
      filename: filename.match(/^.*\.z13$/i) !== null,
      header: undefined, // no specific header
    };
  }
}
