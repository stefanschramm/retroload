import {type BlockDecodingResult} from '../BlockDecodingResult.js';

export type ElectronBlockProvider = {
  blocks(): Generator<BlockDecodingResult>;
};
export {BlockDecodingResult};

