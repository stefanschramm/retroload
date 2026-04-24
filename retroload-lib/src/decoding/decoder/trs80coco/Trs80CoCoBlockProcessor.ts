import {FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {allBlocksSuccessful} from '../BlockDecodingResult.js';
import {Trs80CoCoBlockDecodingResult, Trs80CoCoHalfPeriodProcessor} from './Trs80CoCoHalfPeriodProcessor.js';

export class Trs80CoCoBlockProcessor {
  private readonly hpp: Trs80CoCoHalfPeriodProcessor;
  private blocks: Trs80CoCoBlockDecodingResult[] = [];

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.hpp = new Trs80CoCoHalfPeriodProcessor(this.halfPeriodProvider);
  }

  public *files(): Generator<FileDecodingResult> {
    for (const blockDecodingResult of this.hpp.blocks()) {
      if (blockDecodingResult.hadIntro && this.blocks.length !== 0) {
        yield this.finishFile();
      }
      this.blocks.push(blockDecodingResult);
      Logger.info(blockDecodingResult.data.asHexDump());
      // analyzeBlock(blockDecodingResult);
      // TODO: Add option to merge BASIC header with following data into one file (+ truncate data to actual length?)
    }
    if (this.blocks.length !== 0) {
      yield this.finishFile();
    }
  }

  private finishFile(): FileDecodingResult {
    const result = new FileDecodingResult(
      this.blocks,
      allBlocksSuccessful(this.blocks) ? FileDecodingResultStatus.Success : FileDecodingResultStatus.Error,
      this.blocks[0].begin,
      this.blocks[this.blocks.length - 1].end,
    );

    this.blocks = [];

    return result;
  }
}
