import {type BlockDecodingResult} from '../BlockDecodingResult.js';

export type KcBlockProvider = {
  blocks(): Generator<BlockDecodingResult>;
};
export {BlockDecodingResult};

