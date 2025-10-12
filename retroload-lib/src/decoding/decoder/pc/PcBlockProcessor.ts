import {FileDecodingResult, FileDecodingResultStatus} from '../FileDecodingResult.js';
import {type PcBlockDecodingResult, PcHalfPeriodProcessor} from './PcHalfPeriodProcessor.js';
import {hex16, hex8} from '../../../common/Utils.js';
import {type HalfPeriodProvider} from '../../half_period_provider/HalfPeriodProvider.js';
import {Logger} from '../../../common/logging/Logger.js';
import {allBlocksSuccessful} from '../BlockDecodingResult.js';

export class PcBlockProcessor {
  private readonly hpp: PcHalfPeriodProcessor;
  private blocks: PcBlockDecodingResult[] = [];

  public constructor(private readonly halfPeriodProvider: HalfPeriodProvider) {
    this.hpp = new PcHalfPeriodProcessor(this.halfPeriodProvider);
  }

  public *files(): Generator<FileDecodingResult> {
    for (const blockDecodingResult of this.hpp.blocks()) {
      if (blockDecodingResult.hadIntro && this.blocks.length !== 0) {
        yield this.finishFile();
      }
      this.blocks.push(blockDecodingResult);
      analyzeBlock(blockDecodingResult);
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

/**
 * http://fileformats.archiveteam.org/wiki/IBM_PC_data_cassette
 */
function analyzeBlock(bdr: PcBlockDecodingResult): void {
  const {data} = bdr;
  if (bdr.hadIntro && data.getUint8(0) === 0xa5) {
    const fileName = data.slice(1, 8).asAsciiString().trimEnd();
    const flags = data.getUint8(9);
    const length = data.getUint16Le(10);
    const loadSegment = data.getUint16Le(12);
    const loadOffset = data.getUint16Le(14);
    Logger.info(`Recognized IBM Cassette BASIC header - Name: ${fileName} Flags: ${hex8(flags)} (${renderFlags(flags)}) Length: ${length} Load address: ${hex16(loadSegment)}:${hex16(loadOffset)}`);
  }
}

function renderFlags(flags: number): string {
  const flagsMapping = [
    'Memory area',
    '?',
    '?',
    '?',
    '?',
    'Protected',
    'ASCII listing',
    'Tokenized BASIC',
  ];
  const enabledFlags: string[] = [];
  flagsMapping.forEach((flagName, bitPosition) => {
    if (flags & (1 << bitPosition)) {
      enabledFlags.push(flagName);
    }
  });

  return enabledFlags.join(', ');
}
