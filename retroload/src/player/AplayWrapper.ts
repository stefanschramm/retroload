import {Logger} from 'retroload-lib';
import {spawnSync} from 'child_process';
import {type PlayerWrapper} from './PlayerWrapper.js';

export class AplayWrapper implements PlayerWrapper {
  static async create(sampleRate: number, bitDepth: number, channels: number): Promise<AplayWrapper | undefined> {
    if (bitDepth !== 8) {
      return undefined;
    }
    const regexp = /^Usage: aplay /;
    const result = spawnSync('aplay', ['--help']);
    if (!regexp.exec(result.stdout.toString())) {
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
    return new Promise((resolve) => {
      Logger.info('Playing via aplay...');
      spawnSync('aplay', ['-r', this.sampleRate.toString(10), '-f', 'U8', '-c', this.channels.toString(10)], {input: buffer});
      resolve(null);
    });
  }
}
