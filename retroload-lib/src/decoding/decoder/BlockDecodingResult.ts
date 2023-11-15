import {type BufferAccess} from '../../common/BufferAccess.js';
import {type Position} from '../../common/Positioning.js';

export class BlockDecodingResult {
  constructor(
    readonly data: BufferAccess,
    readonly status: BlockDecodingResultStatus,
    readonly begin: Position,
    readonly end: Position,
  ) {}
}

export enum BlockDecodingResultStatus {
  /**
   * A complete block has successfully been read.
   */
  Complete,
  /**
   * A complete block has been read, but its checksum was incorrect.
   */
  InvalidChecksum,
  /**
   * Reading of a block was partial because of an encoding error.
   */
  Partial,
}

export function allBlocksSuccessful(blocks: BlockDecodingResult[]): boolean {
  for (const block of blocks) {
    if (block.status !== BlockDecodingResultStatus.Complete) {
      return false;
    }
  }

  return true;
}
