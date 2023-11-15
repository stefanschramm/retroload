import {type BlockDecodingResult} from '../BlockDecodingResult.js';

export type Z1013BlockProvider = {
  blocks(): Generator<BlockDecodingResult>;
};
export {BlockDecodingResult};
