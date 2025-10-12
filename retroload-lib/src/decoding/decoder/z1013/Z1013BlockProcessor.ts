import {type BlockDecodingResult, allBlocksSuccessful} from '../BlockDecodingResult.js';
import {FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {type Z1013BlockProvider} from './Z1013BlockProvider.js';

/**
 * Minimal expected gap between files in seconds (from end of previous block to begin of next block)
 */
const maxIntraFileBlockGap = 1;

export class Z1013BlockProcessor {
  private blocks: BlockDecodingResult[] = [];

  public constructor(
    private readonly blockProvider: Z1013BlockProvider,
  ) {}

  public *files(): Generator<FileDecodingResult> {
    for (const block of this.blockProvider.blocks()) {
      if (!this.belongsToCurrentFile(block)) {
        yield this.finishFile();
      }
      this.blocks.push(block);
    }
    if (this.blocks.length !== 0) {
      yield this.finishFile();
    }
  }

  private belongsToCurrentFile(block: BlockDecodingResult): boolean {
    if (this.blocks.length === 0) {
      return true;
    }
    const previousDecodedBlock = this.blocks[this.blocks.length - 1];
    if (block.end.seconds - previousDecodedBlock.end.seconds < maxIntraFileBlockGap) {
      return true;
    }

    return false;
  }

  private finishFile(): FileDecodingResult {
    const fdr = new FileDecodingResult(
      this.blocks,
      allBlocksSuccessful(this.blocks) ? FileDecodingResultStatus.Success : FileDecodingResultStatus.Error,
      this.blocks[0].begin,
      this.blocks[this.blocks.length - 1].end,
    );
    this.blocks = [];

    return fdr;
  }
}
