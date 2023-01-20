import {AbstractAdapter} from '../adapter.js';
import {Encoder} from '../../encoder/z1013.js';

export class Z1013Adapter extends AbstractAdapter {
  static getTargetName() {
    return Encoder.getTargetName();
  }

  static encode(recorder, dataView, options) {
    const e = new Encoder(recorder);
    e.begin();
    e.recordData(dataView);
    e.end();
  }
}
