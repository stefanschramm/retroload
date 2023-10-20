import {Logger} from 'retroload-lib';
import {type PlayerWrapper} from './PlayerWrapper.js';
import {playerExists, spawnPlayer} from './Utils.js';

export class AplayWrapper implements PlayerWrapper {
  static async create(sampleRate: number, bitDepth: number, channels: number): Promise<AplayWrapper | undefined> {
    if (bitDepth !== 8) {
      return undefined;
    }
    if (!playerExists('aplay', ['--help'], /^Usage: aplay /)) {
      return undefined;
    }

    return new AplayWrapper(sampleRate, channels);
  }

  private constructor(
    private readonly sampleRate: number,
    private readonly channels: number,
  ) {
  }

  async play(buffer: Uint8Array) {
    Logger.info('Playing via aplay...');
    return spawnPlayer(buffer, 'aplay', ['-r', this.sampleRate.toString(10), '-f', 'U8', '-c', this.channels.toString(10)]);
  }
}
