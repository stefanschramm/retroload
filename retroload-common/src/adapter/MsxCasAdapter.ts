import {AbstractAdapter} from './AbstractAdapter.js';
import {MsxEncoder} from '../encoder/MsxEncoder.js';
import {Logger} from '../Logger.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type OptionValues} from '../Options.js';

const blockHeader = [0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74];

const typeHeaderLength = 10;
const headerTypes = {
  binary: Array(typeHeaderLength).fill(0xd0),
  basic: Array(typeHeaderLength).fill(0xd3),
  ascii: Array(typeHeaderLength).fill(0xea),
};

export class MsxCasAdapter extends AbstractAdapter {
  static override getTargetName() {
    return MsxEncoder.getTargetName();
  }

  static override getName() {
    return 'MSX .CAS-File';
  }

  static override getInternalName() {
    return 'msxcas';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.cas$/i).exec(filename) !== null,
      header: ba.containsDataAt(0, blockHeader),
    };
  }

  static override getOptions() {
    return MsxEncoder.getOptions();
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionValues) {
    const e = new MsxEncoder(recorder, options);
    e.begin();
    for (let i = 0; i < ba.length(); i++) {
      if (i % 8 === 0 && ba.containsDataAt(i, blockHeader)) {
        const blockHeaderPosition = i;
        i += blockHeader.length;
        const type = this.determineType(ba, i);
        const long = (['binary', 'basic', 'ascii'] as Array<string | undefined>).includes(type);
        Logger.debug(`MsxCasAdapter - block header at\t0x' ${(blockHeaderPosition).toString(16).padStart(4, '0')}\t type: ${type!}`);
        e.recordHeader(long);
      }
      e.recordByte(ba.getUint8(i));
    }
    e.end();
  }

  static determineType(dataBa: BufferAccess, offset: number) {
    for (const [type, header] of Object.entries(headerTypes)) {
      if (dataBa.containsDataAt(offset, header)) {
        return type;
      }
    }

    return undefined; // unknown
  }
}
