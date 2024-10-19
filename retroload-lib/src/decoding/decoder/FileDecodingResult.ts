import {type BlockDecodingResult} from './BlockDecodingResult.js';
import {type Position} from '../../common/Positioning.js';

export class FileDecodingResult {
  public constructor(
    public readonly blocks: BlockDecodingResult[],
    public readonly status: FileDecodingResultStatus,
    public readonly begin: Position,
    public readonly end: Position,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
