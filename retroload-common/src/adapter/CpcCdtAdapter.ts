import {AbstractAdapter} from './AbstractAdapter.js';
import {CpcTzxEncoder} from '../encoder/CpcTzxEncoder.js';
import {TzxProcessor} from './TzxProcessor.js';
import {type OptionValues} from '../Options.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileHeader = 'ZXTape!\x1a';

export class CpcCdtAdapter extends AbstractAdapter {
  static getTargetName() {
    return CpcTzxEncoder.getTargetName();
  }

  static getName() {
    return 'CPC .CDT-File';
  }

  static getInternalName() {
    return 'cpccdt';
  }

  static identify(filename, ba: BufferAccess) {
    return {
      filename: filename.match(/^.*\.cdt/i) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new CpcTzxEncoder(recorder, options);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
