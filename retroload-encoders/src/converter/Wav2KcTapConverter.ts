import {BufferAccess} from 'retroload-common';
import {WaveDecoder} from '../decoder/WaveDecoder.js';
import {SampleToHalfPeriodConverter} from '../decoder/SampleToHalfPeriodConverter.js';
import {type OutputFile, type ConverterDefinition, type ConverterSettings} from './ConverterManager.js';
import {KcHalfPeriodProcessor, BlockDecodingResultStatus} from './kc/KcHalfPeriodProcessor.js';
import {Logger} from '../Logger.js';
import {hex8} from '../Utils.js';

export const wav2KcTapConverter: ConverterDefinition = {
  from: 'wav',
  to: 'kctap',
  convert,
};

function convert(ba: BufferAccess, settings: ConverterSettings): OutputFile[] {
  const sampleProvider = new WaveDecoder(ba);
  const halfPeriodProvider = new SampleToHalfPeriodConverter(sampleProvider);
  const hpp = new KcHalfPeriodProcessor(halfPeriodProvider);
  const blockProcessor = new KcBlockProcessor(hpp, settings);

  const files = [];
  for (const fileDecodingResult of blockProcessor.files()) {
    if (fileDecodingResult.status !== FileDecodingResultStatus.Error || settings.onError !== 'skipfile') {
      files.push(bufferAccessListToOutputFile(fileDecodingResult.blocks));
    }
  }

  return files;
}

class KcBlockProcessor {
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
    console.log(this.settings);

    for (const decodingResult of this.blockProvider.blocks()) {
      switch (decodingResult.status) {
        case BlockDecodingResultStatus.Complete:
          break;
        case BlockDecodingResultStatus.InvalidChecksum:
        case BlockDecodingResultStatus.Partial:
          // TODO: stop? zerofill?
          this.errorOccured = true;
          break;
        default:
          throw new Error('Unexpected BlockDecodingResultStatus.');
      }

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

class FileDecodingResult {
  constructor(
    readonly blocks: BufferAccess[],
    readonly status: FileDecodingResultStatus,
  ) {}
}

enum FileDecodingResultStatus {
  Success,
  Error,
}

function bufferAccessListToOutputFile(blocks: BufferAccess[]): OutputFile {
  const fileHeader = '\xc3KC-TAPE by AF. ';
  const data = BufferAccess.create(fileHeader.length + 129 * blocks.length);
  data.writeAsciiString(fileHeader);
  for (const block of blocks) {
    data.writeBa(block);
  }
  const filename = data.slice(0x14, 8).asAsciiString().trim();
  const proposedName = `${restrictCharacters(filename)}.tap`;

  return {proposedName, data};
}

function restrictCharacters(value: string): string {
  return value.replace(/[^A-Za-z0-9_.,]/g, '_');
}
