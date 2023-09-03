import {BufferAccess} from '../../../common/BufferAccess.js';
import {type ConverterSettings} from '../ConverterManager.js';
import {FileDecodingResultStatus, KcBlockProcessor} from './KcBlockProcessor.js';
import {BlockDecodingResult, BlockDecodingResultStatus, type KcBlockProvider} from './KcBlockProvider.js';

describe('KcBlockProcessor', () => {
  test('Generates a single file from a single file dump', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);
    const settings: ConverterSettings = {onError: 'stop', skip: 0, channel: undefined};

    const files = [...(new KcBlockProcessor(blockProvider, settings)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Success);
    expect(files[0].blocks[0].getUint8(0)).toBe(1);
    expect(files[0].blocks[1].getUint8(0)).toBe(2);
    expect(files[0].blocks[2].getUint8(0)).toBe(0xff);
  });

  test('Generates two files from a multiple file dump', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);
    const settings: ConverterSettings = {onError: 'stop', skip: 0, channel: undefined};

    const files = [...(new KcBlockProcessor(blockProvider, settings)).files()];

    expect(files.length).toBe(2);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Success);
    expect(files[1].blocks.length).toBe(2);
    expect(files[1].status).toBe(FileDecodingResultStatus.Success);
  });

  test('Marks a file as broken if one block was only partially loaded', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Partial),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);
    const settings: ConverterSettings = {onError: 'ignore', skip: 0, channel: undefined};

    const files = [...(new KcBlockProcessor(blockProvider, settings)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Error);
    expect(files[0].blocks[0].getUint8(0)).toBe(1);
    expect(files[0].blocks[1].getUint8(0)).toBe(2);
    expect(files[0].blocks[2].getUint8(0)).toBe(0xff);
  });

  test('Marks a file as broken if one block had an invalid checksum', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.InvalidChecksum),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);
    const settings: ConverterSettings = {onError: 'ignore', skip: 0, channel: undefined};

    const files = [...(new KcBlockProcessor(blockProvider, settings)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Error);
    expect(files[0].blocks[0].getUint8(0)).toBe(1);
    expect(files[0].blocks[1].getUint8(0)).toBe(2);
    expect(files[0].blocks[2].getUint8(0)).toBe(0xff);
  });
});

class KcBlockProviderMock implements KcBlockProvider {
  constructor(
    private readonly blockDecodingResults: BlockDecodingResult[],
  ) {}

  getCurrentPositionSample(): number {
    return 0;
  }

  getCurrentPositionSecond(): number {
    return 0;
  }

  * blocks(): Generator<BlockDecodingResult> {
    for (const bdr of this.blockDecodingResults) {
      yield bdr;
    }
  }
}

function blockDecodingResult(
  blockId: number,
  result: BlockDecodingResultStatus,
): BlockDecodingResult {
  const ba = BufferAccess.create(129);
  ba.setUint8(0, blockId);
  return new BlockDecodingResult(ba, result, 0, 1);
}
