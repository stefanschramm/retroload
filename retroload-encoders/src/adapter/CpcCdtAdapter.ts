import {AbstractAdapter} from './AbstractAdapter.js';
import {CpcTzxEncoder} from '../encoder/CpcTzxEncoder.js';
import {TzxProcessor} from './TzxProcessor.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from 'retroload-common';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileHeader = 'ZXTape!\x1a';

export class CpcCdtAdapter extends AbstractAdapter {
  static override getTargetName() {
    return CpcTzxEncoder.getTargetName();
  }

  static override getName() {
    return 'CPC .CDT-File';
  }

  static override getInternalName() {
    return 'cpccdt';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.cdt/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new CpcTzxEncoder(recorder, options);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
