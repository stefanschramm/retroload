import {BufferAccess} from '../../../common/BufferAccess.js';
import {DecodingError} from '../../DecoderExceptions.js';
import {BlockDecodingResult, BlockDecodingResultStatus} from '../BlockDecodingResult.js';
import {FileDecodingResultStatus} from '../FileDecodingResult.js';
import {KcBlockProcessor} from './KcBlockProcessor.js';
import {type KcBlockProvider} from './KcBlockProvider.js';

describe('KcBlockProcessor', () => {
  test('Generates a single file from a single file dump', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);
    const files = [...(new KcBlockProcessor(blockProvider, true)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Success);
    expect(files[0].blocks[0].data.getUint8(0)).toBe(1);
    expect(files[0].blocks[1].data.getUint8(0)).toBe(2);
    expect(files[0].blocks[2].data.getUint8(0)).toBe(0xff);
  });

  test('Generates two files from a multiple file dump', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete), // first block of second file
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);

    const files = [...(new KcBlockProcessor(blockProvider, true)).files()];

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

    const files = [...(new KcBlockProcessor(blockProvider, false)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Error);
    expect(files[0].blocks[0].data.getUint8(0)).toBe(1);
    expect(files[0].blocks[1].data.getUint8(0)).toBe(2);
    expect(files[0].blocks[2].data.getUint8(0)).toBe(0xff);
  });

  test('Marks a file as broken if one block had an invalid checksum', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.InvalidChecksum),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);

    const files = [...(new KcBlockProcessor(blockProvider, false)).files()];

    expect(files.length).toBe(1);
    expect(files[0].blocks.length).toBe(3);
    expect(files[0].status).toBe(FileDecodingResultStatus.Error);
    expect(files[0].blocks[0].data.getUint8(0)).toBe(1);
    expect(files[0].blocks[1].data.getUint8(0)).toBe(2);
    expect(files[0].blocks[2].data.getUint8(0)).toBe(0xff);
  });

  test('Stops if one block was only partialy loaded and stopping was requested', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.Partial),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);

    let catched: any;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const files = [...(new KcBlockProcessor(blockProvider, true)).files()];
    } catch (e) {
      catched = e;
    }
    expect(catched).toBeInstanceOf(DecodingError);
    expect(catched.message).toBe('Stopping.');
  });

  test('Stops if one block had an invalid checksum and stopping was requested', () => {
    const blockProvider = new KcBlockProviderMock([
      blockDecodingResult(0x01, BlockDecodingResultStatus.Complete),
      blockDecodingResult(0x02, BlockDecodingResultStatus.InvalidChecksum),
      blockDecodingResult(0xff, BlockDecodingResultStatus.Complete),
    ]);

    let catched: any;
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const files = [...(new KcBlockProcessor(blockProvider, true)).files()];
    } catch (e) {
      catched = e;
    }
    expect(catched).toBeInstanceOf(DecodingError);
    expect(catched.message).toBe('Stopping.');
  });
});

class KcBlockProviderMock implements KcBlockProvider {
  constructor(
    private readonly blockDecodingResults: BlockDecodingResult[],
  ) {}

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
  return new BlockDecodingResult(ba, result, {samples: 0, seconds: 0}, {samples: 1, seconds: 1});
}
