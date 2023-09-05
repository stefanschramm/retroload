import {type Changes} from './EditorState.js';

export class WavFile {
  public readonly sampleCount: number;

  constructor() {
    this.sampleCount = 500;
  }

  public getSample(x: number): number {
    return Math.round(Math.sin(x / 10) * 0x80) + 0x80;
  }

  public write(changes: Changes): void {
    for (const x of Object.keys(changes)) {
      const xInt = parseInt(x, 10); // ugly!
      if (xInt < 0 || xInt > this.sampleCount) {
        throw new Error(`Invalid changed sample position: ${xInt}`);
      }
    }

    console.log('ok', changes);
  }

  public reload(): void {
    console.log('reloaded');
  }
}
