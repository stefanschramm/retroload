import {type EditorState} from './EditorState.js';
import type tty from 'tty';

export type ViewWidthChangeListener = {
  onViewWidthChange(newWidth: number): void;
};

const colorActive = '\x1b[33m';
const colorMuted = '\x1b[90m';
const colorReset = '\x1b[0m';

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
    const graphHeight = size[1] - 6;
    this.drawSamples(graphHeight, 3, 2);
    this.drawFooter(size[1]);
  }

  public setStatus(status: string): void {
    this.status = status;
  }

  public getViewWidth(): number {
    return this.terminal.getWindowSize()[0] - 5;
  }

  private resize(): void {
    this.listener.onViewWidthChange(this.getViewWidth());
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
      const xOriginal = this.state.viewOffset + i;
      const x = offsetX + i;
      const yOriginal = offsetY + height - 1 - Math.round(originalValue * ((height - 1) / 0xff));
      const isSelected = xOriginal >= this.state.editRange[0] && xOriginal <= this.state.editRange[1];
      const changedValue = this.state.changes[i + this.state.viewOffset];
      const isChanged = changedValue !== undefined;
      this.terminal.cursorTo(x, yOriginal);
      if (isChanged) {
        this.terminal.write(`${colorMuted}o${colorReset}`);
        const yChanged = offsetY + height - 1 - Math.round(changedValue * ((height - 1) / 0xff));
        this.terminal.cursorTo(x, yChanged);
        this.terminal.write(isSelected ? `${colorActive}o${colorReset}` : 'o');
      } else {
        this.terminal.write((isSelected) ? `${colorActive}o${colorReset}` : 'o');
      }
    }

    const leftOffsetLabel = this.state.viewOffset.toString();
    this.terminal.cursorTo(offsetX, offsetY + height);
    this.terminal.write(leftOffsetLabel);

    const rightViewOffsetLabel = (this.state.viewOffset + visibleDataWidth).toString();
    this.terminal.cursorTo(offsetX + visibleDataWidth - rightViewOffsetLabel.length, offsetY + height);
    this.terminal.write(rightViewOffsetLabel);

    const editRangeOffset = this.state.editRange[0] - this.state.viewOffset;
    const editRangeLength = this.state.editRange[1] - this.state.editRange[0] + 1;
    this.terminal.cursorTo(offsetX + editRangeOffset, offsetY + height + 1);
    this.terminal.write('^'.repeat(editRangeLength));

    if (this.state.editRange[0] === this.state.editRange[1]) {
      this.terminal.cursorTo(offsetX + editRangeOffset, offsetY + height + 2);
      this.terminal.write(this.state.editRange[0].toString());
    } else {
      const labelLeft = this.state.editRange[0].toString();
      this.terminal.cursorTo(offsetX + editRangeOffset - labelLeft.length, offsetY + height + 2);
      this.terminal.write(labelLeft);
      const labelRight = this.state.editRange[1].toString(); // TODO: check end of screen
      this.terminal.cursorTo(offsetX + editRangeOffset + editRangeLength, offsetY + height + 2);
      this.terminal.write(labelRight);
    }
  }

  private drawFooter(y: number) {
    this.terminal.cursorTo(0, y);
    this.terminal.write(this.status);
    this.status = '';
  }
}
