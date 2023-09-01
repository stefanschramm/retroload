/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Logger} from 'retroload-lib';
// @ts-ignore
import type Speaker from 'speaker';
import stream from 'stream';
import {type PlayerWrapper} from './PlayerWrapper.js';

export class SpeakerWrapper implements PlayerWrapper {
  static async create(sampleRate: number, bitDepth: number, channels: number): Promise<SpeakerWrapper | undefined> {
    try {
      // Dynamically try to load speaker module.
      // This way it doesn't need to be an actual dependency.
      // @ts-ignore
      const Speaker = (await import('speaker')).default;
      return new SpeakerWrapper(new Speaker({channels, bitDepth, sampleRate}));
    } catch (e: any) {
      if (e.code === 'ERR_MODULE_NOT_FOUND') {
        return undefined;
      }
      console.error(e);
      process.exit(1);
    }
  }

  private constructor(
    private readonly speaker: Speaker,
  ) {}

  async play(buffer: Uint8Array) {
    return new Promise((resolve) => {
      Logger.info('Playing via speaker library...');
      const s = new stream.PassThrough();
      s.push(buffer);
      s.push(null);
      this.speaker.on('finish', () => {
        resolve(null);
      });
      s.pipe(this.speaker);
    });
  }
}
