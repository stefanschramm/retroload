import {playerExists, spawnPlayer} from './Utils.js';
import {Logger} from 'retroload-lib';
import {type PlayerWrapper} from './PlayerWrapper.js';

export class AplayWrapper implements PlayerWrapper {
  // eslint-disable-next-line require-await
  public static async create(sampleRate: number, bitDepth: number, channels: number): Promise<AplayWrapper | undefined> {
    if (bitDepth !== 8) {
      return undefined;
    }
    if (!playerExists('aplay', ['--help'], /^Usage: aplay /u)) {
      return undefined;
    }

    return new AplayWrapper(sampleRate, channels);
  }

  private constructor(
    private readonly sampleRate: number,
    private readonly channels: number,
  ) {
  }

  // eslint-disable-next-line require-await
  public async play(buffer: Uint8Array): Promise<unknown> {
    Logger.info('Playing via aplay...');
    return spawnPlayer(buffer, 'aplay', ['-r', this.sampleRate.toString(10), '-f', 'U8', '-c', this.channels.toString(10)]);
  }
}
