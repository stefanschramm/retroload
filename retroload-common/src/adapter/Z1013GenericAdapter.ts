import {type BufferAccess} from '../BufferAccess.js';
import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {type OptionValues} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractGenericAdapter} from './AbstractGenericAdapter.js';

export class Z1013GenericAdapter extends AbstractGenericAdapter {
  static getTargetName() {
    return Z1013Encoder.getTargetName();
  }

  static getName() {
    return 'Z1013 (Generic data)';
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new Z1013Encoder(recorder, options);
    e.begin();
    e.recordData(ba);
    e.end();
  }
}
