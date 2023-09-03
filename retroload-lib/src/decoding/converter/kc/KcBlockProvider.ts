import {type BufferAccess} from '../../../common/BufferAccess.js';

export type KcBlockProvider = {
  getCurrentPositionSample(): number;
  getCurrentPositionSecond(): number;
  blocks(): Generator<BlockDecodingResult>;
};

export class BlockDecodingResult {
  constructor(
    readonly data: BufferAccess,
    readonly status: BlockDecodingResultStatus,
    readonly blockBeginSeconds: number,
    readonly blockEndSeconds: number,
  ) {}
}

export enum BlockDecodingResultStatus {
  /**
   * A complete block has successfully been read.
   */
  Complete,
  /**
   * A complete block has been read, but it's checksum was incorrect.
   */
  InvalidChecksum,
  /**
   * Reading of a block was partial because of an encoding error.
   */
  Partial,
}
