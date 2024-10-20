import {BufferAccess} from '../common/BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {type TokenizerDefinition} from './TokenizerDefinition.js';
import {tokens} from './tokens/c64.js';

export const C64BasicTokenizer: TokenizerDefinition = {
  name: 'c64',
  extension: 'prg',
  tokenize,
};

function tokenize(str: string): BufferAccess {
  // TODO: Offer option to convert to PETSCII
  const offset = 0x0800;
  const lineDataBa = PointerBasedSourceTokenizer.tokenize(offset, tokens, str);

  const c64PrgBa = BufferAccess.create(lineDataBa.length() + 3);
  c64PrgBa.writeUint16Le(offset);
  c64PrgBa.writeUint8(0);
  c64PrgBa.writeBa(lineDataBa);

  return c64PrgBa;
}
