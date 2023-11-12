import {type Position} from '../../common/Positioning.js';
import {type BlockDecodingResult} from './BlockDecodingResult.js';

export class FileDecodingResult {
  constructor(
    readonly blocks: BlockDecodingResult[],
    readonly status: FileDecodingResultStatus,
    readonly begin: Position,
    readonly end: Position,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
