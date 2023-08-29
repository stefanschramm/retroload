import {type BufferAccess} from 'retroload-common';
import {type ConverterSettings} from '../ConverterManager.js';
import {BlockDecodingResultStatus, type KcHalfPeriodProcessor} from './KcHalfPeriodProcessor.js';
import {hex8} from '../../Utils.js';
import {Logger} from '../../Logger.js';
import {DecodingError} from '../ConverterExceptions.js';

export class KcBlockProcessor {
  private readonly blockProvider: KcHalfPeriodProcessor;
  private readonly settings: ConverterSettings;

  private blocks: BufferAccess[] = [];
  private errorOccured = false;
  private previousBlockNumber: number | undefined;

  constructor(blockProvider: KcHalfPeriodProcessor, settings: ConverterSettings) {
    this.blockProvider = blockProvider;
    this.settings = settings;
  }

  * files(): Generator<FileDecodingResult> {
    for (const decodingResult of this.blockProvider.blocks()) {
      switch (decodingResult.status) {
        case BlockDecodingResultStatus.Complete:
          break;
        case BlockDecodingResultStatus.InvalidChecksum:
        case BlockDecodingResultStatus.Partial:
          if (this.settings.onError === 'stop') {
            throw new DecodingError('Stopping.');
          }
          this.errorOccured = true;
          break;
        default:
          throw new Error('Unexpected BlockDecodingResultStatus.');
      }

      // TODO: Check distance of block to the end of the previous and start a new file if it exceeds a certain threshold
      const blockNumber = decodingResult.data.getUint8(0);
      if (this.blockNumberBelongsToNextFile(blockNumber)) {
        yield this.finishFile();
      }
      this.blocks.push(decodingResult.data);
      this.previousBlockNumber = blockNumber;
    }

    yield this.finishFile();
  }

  private finishFile(): FileDecodingResult {
    const result = new FileDecodingResult(
      this.blocks,
      this.errorOccured ? FileDecodingResultStatus.Error : FileDecodingResultStatus.Success,
    );
    this.blocks = [];
    this.errorOccured = false;

    return result;
  }

  private blockNumberBelongsToNextFile(blockNumber: number): boolean {
    if (this.previousBlockNumber !== undefined) {
      if (blockNumber <= this.previousBlockNumber) {
        this.validateFirstBlockNumber(blockNumber);
        return true;
      }
      if (blockNumber > this.previousBlockNumber + 1 && blockNumber !== 0xff) {
        Logger.info(`Warning: Missing block. Got block number ${hex8(blockNumber)} but expected was ${hex8(this.previousBlockNumber + 1)} or 0xff.`);
      }
      return false;
    }

    this.validateFirstBlockNumber(blockNumber);
    return false;
  }

  private validateFirstBlockNumber(blockNumber: number): void {
    if (blockNumber !== 0 && blockNumber !== 1) {
      Logger.info(`Warning: Got first block with block number ${hex8(blockNumber)}`);
    }
  }
}

export class FileDecodingResult {
  constructor(
    readonly blocks: BufferAccess[],
    readonly status: FileDecodingResultStatus,
  ) {}
}

export enum FileDecodingResultStatus {
  Success,
  Error,
}
