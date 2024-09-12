import {type BufferAccess} from '../common/BufferAccess.js';
import {PointerBasedSourceTokenizer} from './PointerBasedTokenizer.js';
import {type TokenizerDefinition} from './TokenizerDefinition.js';
import {tokens} from './tokens/msx.js';

const definition: TokenizerDefinition = {
  name: 'msx',
  extension: 'bas',
  tokenize,
};
export default definition;

function tokenize(str: string): BufferAccess {
  // TODO: untested
  const offset = 0x8000;

  return PointerBasedSourceTokenizer.tokenize(offset, tokens, str);
}
