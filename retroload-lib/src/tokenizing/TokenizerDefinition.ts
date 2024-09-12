import {type BufferAccess} from '../common/BufferAccess.js';

export type TokenizerDefinition = {
  name: string;
  extension: string;
  tokenize: (str: string) => BufferAccess;
};

