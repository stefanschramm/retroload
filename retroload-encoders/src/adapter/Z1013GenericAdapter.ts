import {type BufferAccess} from 'retroload-common';
import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

export class Z1013GenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return Z1013Encoder.getTargetName();
  }

  static override getName() {
    return 'Z1013 (Generic data)';
  }

  static override getInternalName(): string {
    return 'z1013generic';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new Z1013Encoder(recorder, options);
    e.begin();
    e.recordData(ba);
    e.end();
  }
}
