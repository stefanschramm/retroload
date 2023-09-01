import {Logger} from 'retroload-lib';
import {spawn, spawnSync} from 'child_process';
import {type PlayerWrapper} from './PlayerWrapper.js';

export class SoxWrapper implements PlayerWrapper {
  static async create(sampleRate: number, bitDepth: number, channels: number): Promise<SoxWrapper | undefined> {
    if (bitDepth !== 8) {
      return undefined;
    }
    const regexp = /^play: +SoX /;
    const result = spawnSync('play', ['--help']);
    if (!regexp.exec(result.stdout.toString())) {
      return undefined;
    }

    return new SoxWrapper(sampleRate, channels);
  }

  private constructor(
    private readonly sampleRate: number,
    private readonly channels: number,
  ) {
  }

  async play(buffer: Uint8Array) {
    return new Promise((resolve) => {
      Logger.info('Playing via sox play...');
      const play = spawn('play', ['-t', 'raw', '-r', this.sampleRate.toString(10), '-e', 'unsigned', '-b', '8', '-c', this.channels.toString(10), '-']);
      play.stdin.write(buffer);
      play.on('close', () => {
        resolve(null);
      });
    });
  }
}
