import {spawn, spawnSync} from 'child_process';
import {Logger} from 'retroload-lib';
import {PassThrough} from 'stream';

export function playerExists(command: string, args: string[], regexp: RegExp): boolean {
  const result = spawnSync(command, args);
  if (result.error !== undefined) {
    return false;
  }

  return Boolean(regexp.exec(result.stdout.toString()));
}

export async function spawnPlayer(buffer: Uint8Array, command: string, args: string[]): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args);
    proc.on('error', (e) => {
      Logger.error(`Error: ${e.message}`);
      reject(e);
    });
    proc.on('close', (_code) => {
      resolve(null);
    });
    const stream = new PassThrough();
    stream.end(buffer);
    stream.pipe(proc.stdin);
  });
}
