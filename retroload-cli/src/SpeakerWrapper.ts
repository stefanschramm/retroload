import {Logger} from 'retroload-encoders';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
import type Speaker from 'speaker';
import stream from 'stream';

export class SpeakerWrapper {
  static async create(sampleRate: number, bitDepth: number, channels: number): Promise<SpeakerWrapper | undefined> {
    const speaker = await initializeSpeaker(sampleRate, bitDepth, channels);
    return speaker === undefined ? undefined : new SpeakerWrapper(speaker);
  }

  speaker: Speaker;

  private constructor(speaker: Speaker) {
    this.speaker = speaker;
  }

  async play(buffer: Uint8Array) {
    return new Promise((resolve) => {
      Logger.info('Playing...');
      const s = new stream.PassThrough();
      s.push(buffer);
      s.push(null);
      this.speaker.on('finish', () => {
        Logger.info('Finished.');
        resolve(null);
      });
      s.pipe(this.speaker);
    });
  }
}

async function initializeSpeaker(sampleRate: number, bitDepth: number, channels: number) {
  try {
    // Dynamically try to load speaker module.
    // This way it doesn't need to be an actual dependency.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Speaker = (await import('speaker')).default;
    return new Speaker({channels, bitDepth, sampleRate});
  } catch (e: any) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('Unable to load speaker module. Install it using "npm install speaker". You may need to install additional system packages like build-essential and libasound2-dev. Alternatively, if you wish to generate a WAVE file, please specify the output file using the -o option.');
    } else {
      console.error(e);
    }
    process.exit(1);
  }
}
