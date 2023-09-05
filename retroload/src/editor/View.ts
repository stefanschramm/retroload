import {type EditorState} from './EditorState.js';
import type tty from 'tty';

export type ViewWidthChangeListener = {
  onViewWidthChange(newWidth: number): void;
};

export class View {
  private status = '';

  constructor(
    private readonly terminal: tty.WriteStream,
    private readonly state: EditorState,
    private readonly listener: ViewWidthChangeListener,
  ) {
    process.stdout.on('resize', () => {
      this.resize();
    });
  }

  public redraw(): void {
    const size = this.terminal.getWindowSize();
    this.clearScreen();
    this.drawHeader(size[0]);
    const graphHeight = size[1] - 3;
    this.drawSamples(graphHeight, 3, 2);
    this.drawFooter(size[1]);
  }

  public setStatus(status: string): void {
    this.status = status;
  }

  private resize(): void {
    this.listener.onViewWidthChange(this.terminal.getWindowSize()[1]);
  }

  private clearScreen() {
    this.terminal.cursorTo(0, 0);
    this.terminal.clearScreenDown();
  }

  private drawHeader(width: number) {
    this.terminal.cursorTo(0, 0);
    this.terminal.write('retroload-wavedit');
    this.terminal.cursorTo(0, 1);
    this.terminal.write('-'.repeat(width));
  }

  private drawSamples(height: number, offsetX: number, offsetY: number) {
    const visibleDataWidth = this.state.samples.length;

    // x-axis
    this.terminal.cursorTo(offsetX, offsetY + Math.floor(height / 2));
    this.terminal.write('-'.repeat(visibleDataWidth));

    // y-axis
    for (let y = 0; y < height; y++) {
      this.terminal.cursorTo(offsetX, offsetY + y);
      this.terminal.write('|');
    }

    // values
    for (let i = 0; i < visibleDataWidth; i++) {
      const originalValue = this.state.samples[i];
      const x = offsetX + i;
      const yOriginal = offsetY + height - 1 - Math.round(originalValue * ((height - 1) / 0xff));
      this.terminal.cursorTo(x, yOriginal);
      this.terminal.write('o');
      const changedValue = this.state.changes[i + this.state.viewOffset];
      if (changedValue !== undefined) {
        const yChanged = offsetY + height - 1 - Math.round(changedValue * ((height - 1) / 0xff));
        this.terminal.cursorTo(x, yChanged);
        this.terminal.write('X');
      }
    }
  }

  private drawFooter(y: number) {
    this.terminal.cursorTo(0, y);
    this.terminal.write(this.status);
    this.status = '';
  }
}
