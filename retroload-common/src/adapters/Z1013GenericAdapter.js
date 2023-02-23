import {Z1013Encoder} from '../encoder/z1013.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class Z1013GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Z1013Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const e = new Z1013Encoder(recorder);
    e.begin();
    e.recordData(ba);
    e.end();
  }
}
