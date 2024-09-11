import {Logger} from 'retroload-lib';
import {type PlayerWrapper} from './PlayerWrapper.js';
import {playerExists, spawnPlayer} from './Utils.js';

export class SoxWrapper implements PlayerWrapper {
  public static async create(sampleRate: number, bitDepth: number, channels: number): Promise<SoxWrapper | undefined> {
    if (bitDepth !== 8) {
      return undefined;
    }
    if (!playerExists('play', ['--help'], /^play: +SoX /)) {
      return undefined;
    }

    return new SoxWrapper(sampleRate, channels);
  }

  private constructor(
    private readonly sampleRate: number,
    private readonly channels: number,
  ) {
  }

  public async play(buffer: Uint8Array) {
    Logger.info('Playing via sox play...');
    return spawnPlayer(buffer, 'play', ['-t', 'raw', '-r', this.sampleRate.toString(10), '-e', 'unsigned', '-b', '8', '-c', this.channels.toString(10), '-']);
  }
}
