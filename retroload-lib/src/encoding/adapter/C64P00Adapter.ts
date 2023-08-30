import {AbstractAdapter} from './AbstractAdapter.js';
import {shortpilotOption, type OptionContainer} from '../Options.js';
import {C64Encoder} from '../encoder/C64Encoder.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';

const fileHeader = 'C64File';

export class C64P00Adapter extends AbstractAdapter {
  static override getTargetName() {
    return C64Encoder.getTargetName();
  }

  static override getName() {
    return 'C64 .P00-File';
  }

  static override getInternalName() {
    return 'c64p00';
  }

  // We support p00 only, not multiple parts (p01, ...)
  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.p00$/i).exec(filename) !== null,
      header: ba.containsDataAt(0, fileHeader),
    };
  }

  static override getOptions() {
    return [
      shortpilotOption, // (not available for .tap)
    ];
  }

  /**
   * http://unusedino.de/ec64/technical/formats/pc64.html
   */
  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const fileName = ba.slice(8, 0x10);
    const loadAddress = ba.getUint16Le(0x1a);
    const data = ba.slice(0x1c);
    const e = new C64Encoder(recorder, options);
    e.begin();
    e.recordPrg(loadAddress, fileName.asAsciiString(), data, options.isFlagSet(shortpilotOption));
    e.end();
  }
}
