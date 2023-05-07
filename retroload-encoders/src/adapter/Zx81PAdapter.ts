import {AbstractAdapter} from './AbstractAdapter.js';
import {Zx81Encoder} from '../encoder/Zx81Encoder.js';
import {type OptionDefinition, type OptionContainer, nameOption} from '../Options.js';
import {type BufferAccess} from 'retroload-common';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {InvalidArgumentError} from '../Exceptions.js';

const defaultName = ' ';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class Zx81PAdapter extends AbstractAdapter {
  static override getTargetName() {
    return Zx81Encoder.getTargetName();
  }

  static override getName() {
    return 'ZX81 .P-File';
  }

  static override getInternalName() {
    return 'zx81p';
  }

  static override identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.p$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  }

  static override getOptions(): OptionDefinition[] {
    return [nameOption];
  }

  static override encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const name = options.getArgument(nameOption);
    const e = new Zx81Encoder(recorder, options);
    e.begin();
    for (const byte of mapFileName(name.length === 0 ? defaultName : name)) {
      e.recordByte(byte);
    }
    e.recordBytes(ba);
    e.end();
  }
}

/**
 * Map file name to ZX 81 charset
 * https://en.wikipedia.org/wiki/ZX81_character_set
 */
function mapFileName(input: string): number[] {
  const mapped = input.toUpperCase().split('').map(mapCharCode);
  mapped[mapped.length - 1] = mapped[mapped.length - 1] | 0x80; // last char: bit 7 set
  return mapped;
}

function mapCharCode(char: string): number {
  const asc = char.charCodeAt(0);
  // A - Z; A: 0x41 in ASCII charset, 0x26 in ZX 81 charset
  if (asc >= 0x41 && asc <= 0x5a) {
    return asc - 27;
  }
  // 0 - 9; 0: 0x30 in ASCII charset, 0x1c in ZX 81 charset
  if (asc >= 0x30 && asc <= 0x39) {
    return asc - 20;
  }
  // Space
  if (asc === 0x20) {
    return 0x00;
  }
  throw new InvalidArgumentError(nameOption.name, 'Filename contains invalid characters. Allowed are letters, numbers and space.');
}
