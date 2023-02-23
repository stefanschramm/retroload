import {Encoder} from '../encoder/z1013.js';
import {AbstractGenericAdapter} from './generic.js';

export class Z1013GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, ba, options) {
    const e = new Encoder(recorder);
    e.begin();
    e.recordData(ba);
    e.end();
  }
}
