import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class Z1013GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Z1013Encoder.getTargetName();
  }

  static getName() {
    return 'Z1013 (Generic data)';
  }

  static encode(recorder, ba, options) {
    const e = new Z1013Encoder(recorder);
    e.begin();
    e.recordData(ba);
    e.end();
  }
}
