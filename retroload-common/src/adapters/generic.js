import {AbstractAdapter} from './adapter.js';

export class AbstractGenericAdapter extends AbstractAdapter {
  static getName() {
    return 'Generic data';
  }

  static getInternalName() {
    return 'generic';
  }

  static identify(filename, ba) {
    return {
      // filename: filename.match(/^.*\.(bin|raw|txt|asc|atascii)$/i) !== null,
      filename: undefined,
      header: undefined,
    };
  }
}
