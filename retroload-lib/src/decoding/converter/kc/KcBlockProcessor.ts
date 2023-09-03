import {type BufferAccess} from '../../../common/BufferAccess.js';
import {hex8} from '../../../common/Utils.js';
import {Logger} from '../../../common/logging/Logger.js';
import {DecodingError} from '../ConverterExceptions.js';
import {formatPosition, type Position} from '../../../common/Positioning.js';
import {type BlockDecodingResult, BlockDecodingResultStatus, type KcBlockProvider} from './KcBlockProvider.js';

/**
 * Minimal expected gap between files in seconds (from end of previous block to begin of next block)
 */
const maximalIntraFileBlockGap = 1;

export class KcBlockProcessor {
  private blocks: BlockDecodingResult[] = [];
  private errorOccured = false;
  private previousBlockNumber: number | undefined;
  private previousBlockEnd: Position = {seconds: 0, samples: 0};
  private successfulBlocksCount = 0;

  constructor(
    private readonly blockProvider: KcBlockProvider,
    private readonly stopOnError: boolean,
  ) {}

  * files(): Generator<FileDecodingResult> {
    for (const decodingResult of this.blockProvider.blocks()) {
      let errorInCurrentBlock = false;
      switch (decodingResult.status) {
        case BlockDecodingResultStatus.Complete:
          this.successfulBlocksCount++;
          break;
        case BlockDecodingResultStatus.InvalidChecksum:
        case BlockDecodingResultStatus.Partial:
          if (this.stopOnError) {
            throw new DecodingError('Stopping.');
          }
          errorInCurrentBlock = true;
          break;
        default:
          throw new Error('Unexpected BlockDecodingResultStatus.');
      }

      const blockNumber = decodingResult.data.getUint8(0);
      if (this.blockBelongsToNextFile(blockNumber, decodingResult.blockBegin)) {
        yield this.finishFile();
      }
      this.errorOccured = this.errorOccured || errorInCurrentBlock;
      this.blocks.push(decodingResult);
      this.previousBlockNumber = blockNumber;
      this.previousBlockEnd = decodingResult.blockEnd;
    }

    yield this.finishFile();
  }

  public getSuccessfulBlockCount(): number {
    return this.successfulBlocksCount;
  }

  private finishFile(): FileDecodingResult {
    const result = new FileDecodingResult(
      this.blocks.map((bdr) => bdr.data),
      this.errorOccured ? FileDecodingResultStatus.Error : FileDecodingResultStatus.Success,
      this.blocks[0].blockBegin,
      this.blocks[this.blocks.length - 1].blockEnd,
    );
    this.blocks = [];
    this.errorOccured = false;

    return result;
  }

  private blockBelongsToNextFile(blockNumber: number, currentPosition: Position): boolean {
    if (this.previousBlockNumber !== undefined) {
      const gapLength = this.previousBlockEnd.seconds - currentPosition.seconds;
      if (blockNumber <= this.previousBlockNumber || gapLength > maximalIntraFileBlockGap) {
        this.validateFirstBlockNumber(blockNumber, currentPosition);
        return true;
      }
      if (blockNumber > this.previousBlockNumber + 1 && blockNumber !== 0xff) {
        Logger.info(`${formatPosition(currentPosition)} Warning: Missing block. Got block number ${hex8(blockNumber)} but expected was ${hex8(this.previousBlockNumber + 1)} or 0xff.`);
      }
      return false;
    }

    this.validateFirstBlockNumber(blockNumber, currentPosition);
    return false;
  }

  private validateFirstBlockNumber(blockNumber: number, currentPosition: Position): void {
    if (blockNumber !== 0 && blockNumber !== 1) {
      Logger.info(`${formatPosition(currentPosition)} Warning: Got first block with block number ${hex8(blockNumber)}`);
    }
  }
}

export class FileDecodingResult {
  constructor(
    readonly blocks: BufferAccess[],
    readonly status: FileDecodingResultStatus,
    readonly begin: Position,
    readonly end: Position,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
