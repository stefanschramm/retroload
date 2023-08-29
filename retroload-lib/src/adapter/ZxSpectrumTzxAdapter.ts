import {AbstractAdapter} from './AbstractAdapter.js';
import {TzxProcessor} from './TzxProcessor.js';
import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionContainer} from '../Options.js';

const fileHeader = 'ZXTape!\x1a';

export class ZxSpectrumTzxAdapter extends AbstractAdapter {
  static override getTargetName() {
    return ZxSpectrumTzxEncoder.getTargetName();
  }

  static override getName() {
    return 'ZX Spectrum .TZX-File';
  }

  static override getInternalName() {
    return 'zxspectrumtzx';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.tzx/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const e = new ZxSpectrumTzxEncoder(recorder, options);
    const tzxProcessor = new TzxProcessor(e);
    tzxProcessor.processTzx(ba);
  }
}
