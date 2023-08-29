import {AbstractAdapter} from './AbstractAdapter.js';
import {InputDataError} from '../Exceptions.js';
import {type OptionContainer} from '../Options.js';
import {type BufferAccess} from '../BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {TiEncoder} from '../encoder/TiEncoder.js';
import {Logger} from '../Logger.js';

/**
 * A .TITape archive can contain several files. They will be appended one after another.
 * When playing, it's probably required to press pause in between the individual files.
 */
export class TiTitapeAdapter extends AbstractAdapter {
  static override getTargetName() {
    return TiEncoder.getTargetName();
  }

  static override getName() {
    return 'TI-99/4A .TITape-File';
  }

  static override getInternalName() {
    return 'titape';
  }

  static override identify(filename: string, ba: BufferAccess) {
    return {
      filename: (/^.*\.titape$/i).exec(filename) !== null,
      header: ba.containsDataAt(0, 'TI-TAPE'),
    };
  }

  static override getOptions() {
    return [];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const length = ba.getUint32Le(0x0c);
    const dataLength = ba.getUint16Le(0x10);
    const filesBa = ba.slice(0x10);
    if (filesBa.length() !== length) {
      Logger.info(`Data length field in header ${dataLength} does not match actual length of remaining data (${filesBa.length()}).`);
    }
    const e = new TiEncoder(recorder, options);
    e.begin();
    let filesBaOffset = 0;
    while (filesBaOffset < filesBa.length()) {
      const fileLength = filesBa.getUint16Le(filesBaOffset);
      // There are another two bytes of unknown purpose.
      const fileDataBa = filesBa.slice(4, fileLength);
      const blocks = fileDataBa.chunksPadded(64);
      if (blocks.length > 255) {
        throw new InputDataError('TITape file contains too many blocks.');
      }
      e.recordHeader(blocks.length);
      for (const block of blocks) {
        e.recordBlock(block);
      }
      filesBaOffset += 4 + fileLength;
    }
    e.end();
  }
}
