/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {Logger} from 'retroload-lib';
import {type PlayerWrapper} from './PlayerWrapper.js';
// @ts-expect-error Ignore missing module because it's just a loose dependency
import type Speaker from 'speaker';
import stream from 'stream';

export class SpeakerWrapper implements PlayerWrapper {
  // eslint-disable-next-line consistent-return
  public static async create(sampleRate: number, bitDepth: number, channels: number): Promise<SpeakerWrapper | undefined> {
    try {
      // Dynamically try to load speaker module.
      // This way it doesn't need to be an actual dependency.
      const DynamicSpeakerImport = (await import('speaker')).default;
      return new SpeakerWrapper(new DynamicSpeakerImport({channels, bitDepth, sampleRate}));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.code === 'ERR_MODULE_NOT_FOUND') {
        return undefined;
      }
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  }

  private constructor(
    private readonly speaker: Speaker,
  ) {}

  public async play(buffer: Uint8Array): Promise<unknown> {
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
