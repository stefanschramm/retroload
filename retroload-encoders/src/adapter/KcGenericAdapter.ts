import {BufferAccess} from 'retroload-common';
import {entryOption, loadOption, nameOption, type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {KcEncoder} from '../encoder/KcEncoder.js';
import {InvalidArgumentError} from '../Exceptions.js';
import {kcFirstBlockOption} from './options/KcOptions.js';
import {AbstractAdapter, unidentifiable, type FormatIdentification} from './AbstractAdapter.js';

const maxFileNameLength = 8;

/**
 * [1] https://hc-ddr.hucki.net/wiki/doku.php/z9001/kassettenformate
 * [2] KC 85/3 Systemhandbuch, p. 82 - 83
 * [3] KC 85/4 Systemhandbuch, p. 93 - 95
 */
export class KcGenericAdapter extends AbstractAdapter {
  static override getTargetName() {
    return KcEncoder.getTargetName();
  }

  static override getName() {
    return 'KC (Generic)';
  }

  static override getInternalName(): string {
    return 'kcgeneric';
  }

  static override identify(_filename: string, _ba: BufferAccess): FormatIdentification {
    return unidentifiable;
  }

  static override getOptions() {
    return [
      nameOption,
      loadOption,
      entryOption,
      kcFirstBlockOption,
    ];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const name = options.getArgument(nameOption);
    const nameComponents = name.split('.');
    if (nameComponents.length > 2) {
      throw new InvalidArgumentError('name', 'File name contains too many dots.');
    }
    const fileName = nameComponents[0];
    if (fileName.length > maxFileNameLength) {
      throw new InvalidArgumentError('name', `Maximum length of filename (${maxFileNameLength}) exceeded.`);
    }
    /**
     * As possible file types (extensions), [2] mentions:
     * COM - machine program,
     * DUM - memory dump,
     * TXT - textfile,
     * ASM - assembler source code,
     * (F) - FORTH source code
     */
    let fileType = 'COM';
    if (nameComponents.length > 1) {
      if (nameComponents[1].length !== 3) {
        throw new InvalidArgumentError('name', 'File type (extension) must consist of 3 characters. Examples: COM, DUM, TXT, ASM, (F)');
      }
      fileType = nameComponents[1]; // explicitly specified type
    }

    const addressEntries = 0x03; // load and execute program (Robotron KCs seem to ignore this value and always expect 3 address entries.)
    const load = options.getArgument(loadOption) ?? 0x0300;
    const end = load + ba.length() - 1;
    const entry = options.getArgument(entryOption) ?? 0x0300;
    const firstBlockNumber = options.getArgument(kcFirstBlockOption);

    const firstBlockBa = BufferAccess.create(128);
    firstBlockBa.writeAsciiString(fileName, 8, 0);
    firstBlockBa.writeAsciiString(fileType);
    firstBlockBa.writeUint8(0); // reserved
    firstBlockBa.writeUint8(0); // reserved
    firstBlockBa.writeUint8(0); // reserved
    firstBlockBa.writeUint8(0); // reserved
    firstBlockBa.writeUint8(0); // reserved
    firstBlockBa.writeUint8(addressEntries);
    firstBlockBa.writeUint16Le(load);
    firstBlockBa.writeUint16Le(end);
    firstBlockBa.writeUint16Le(entry);

    const e = new KcEncoder(recorder, options);
    let blockId = firstBlockNumber;
    e.begin();
    e.recordBlock(blockId, firstBlockBa);
    const chunks = ba.chunksPadded(128);
    for (blockId = 1; blockId <= chunks.length; blockId++) {
      const isLastBlock = blockId === chunks.length;
      e.recordBlock(isLastBlock ? 0xff : blockId, chunks[blockId - 1]);
    }
    e.end();
  }
}
