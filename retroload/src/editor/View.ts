import {type EditorState} from './EditorState.js';
import type tty from 'tty';

export type ViewWidthChangeListener = {
  onViewWidthChange(newWidth: number): void;
};

const colorActive = '\x1b[36m';
const colorMuted = '\x1b[90m';
const colorReset = '\x1b[0m';

export class View {
  private status = '';
  private title = '';

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
    if (this.state.samples.length > size[0]) {
      throw new Error(`Too many samples ${this.state.samples.length} to display (width: ${size[0]}).`);
    }
    if ((this.state.editRange[0] < this.state.viewOffset)
      || (this.state.editRange[1] < this.state.viewOffset)
      || (this.state.editRange[0] > this.state.viewOffset + size[0])
      || (this.state.editRange[1] > this.state.viewOffset + size[0])
    ) {
      throw new Error('Edit range not (completely) within view.');
    }
    this.clearScreen();
    this.drawHeader();
    const graphHeight = size[1] - 6;
    this.drawSamples(graphHeight - 3, 0, 2, size[0]);
    this.drawFooter(size[1]);
  }

  public setTitle(title: string): void {
    this.title = title;
  }

  public setStatus(status: string): void {
    this.status = status;
  }

  public getViewWidth(): number {
    return this.terminal.getWindowSize()[0];
  }

  private resize(): void {
    this.listener.onViewWidthChange(this.getViewWidth());
  }

  private clearScreen() {
    this.terminal.cursorTo(0, 0);
    this.terminal.clearScreenDown();
  }

  private drawHeader() {
    this.terminal.cursorTo(0, 0);
    this.terminal.write('retroload-wavedit');
    if (this.title !== '') {
      this.terminal.write(` - ${this.title}`);
    }
    this.terminal.cursorTo(0, 1);
  }

  private drawSamples(height: number, offsetX: number, offsetY: number, windowWidth: number) {
    const visibleDataWidth = this.state.samples.length;

    this.drawHorizontalLine(offsetY - 1, windowWidth);

    // values
    const blockChar = '█';
    for (let y = 0; y < height; y++) {
      const drawValue = 0xff - y * (0xff / height);
      const rowChars = this.state.samples.map((originalValue: number, idx: number) => {
        const xSample = this.state.viewOffset + idx;
        const changedValue = this.state.changes[xSample];
        const isChanged = changedValue !== undefined;
        const isOriginalValueDrawn = (drawValue > 0x80 && originalValue > drawValue) || (drawValue <= 0x80 && originalValue <= drawValue);
        const isChangedValueDrawn = isChanged && (drawValue > 0x80 && changedValue > drawValue) || (drawValue <= 0x80 && changedValue <= drawValue);
        const isSelected = xSample >= this.state.editRange[0] && xSample <= this.state.editRange[1];
        if (isChangedValueDrawn) {
          if (isSelected) {
            return `${colorActive}${blockChar}${colorReset}`;
          }
          return blockChar;
        }
        if (isOriginalValueDrawn) {
          if (isChanged) {
            return `${colorMuted}${blockChar}${colorReset}`;
          }
          if (isSelected) {
            return `${colorActive}${blockChar}${colorReset}`;
          }
          return blockChar;
        }
        return ' ';
      });
      this.terminal.cursorTo(offsetX, offsetY + y);
      this.terminal.write(rowChars.join(''));
    }

    this.drawHorizontalLine(offsetY + height, windowWidth);

    const leftOffsetLabel = this.state.viewOffset.toString();
    this.terminal.cursorTo(offsetX, offsetY + height + 1);
    this.terminal.write(leftOffsetLabel);

    const rightViewOffsetLabel = (this.state.viewOffset + visibleDataWidth - 1).toString();
    this.terminal.cursorTo(offsetX + visibleDataWidth - rightViewOffsetLabel.length, offsetY + height + 1);
    this.terminal.write(rightViewOffsetLabel);

    const editRangeOffset = this.state.editRange[0] - this.state.viewOffset;
    const editRangeLength = this.state.editRange[1] - this.state.editRange[0] + 1;
    this.terminal.cursorTo(offsetX + editRangeOffset, offsetY + height + 2);
    this.terminal.write(`${colorActive}${'^'.repeat(editRangeLength)}${colorReset}`);

    if (this.state.editRange[0] === this.state.editRange[1]) {
      this.terminal.cursorTo(offsetX + editRangeOffset, offsetY + height + 3);
      this.terminal.write(`${colorActive}${this.state.editRange[0]}${colorReset}`);
    } else {
      const labelLeft = this.state.editRange[0].toString();
      this.terminal.cursorTo(offsetX + editRangeOffset - labelLeft.length, offsetY + height + 3);
      this.terminal.write(`${colorActive}${labelLeft}${colorReset}`);
      const labelRight = this.state.editRange[1].toString(); // TODO: check end of screen
      this.terminal.cursorTo(offsetX + editRangeOffset + editRangeLength, offsetY + height + 3);
      this.terminal.write(`${colorActive}${labelRight}${colorReset}`);
    }
  }

  private drawFooter(y: number) {
    this.terminal.cursorTo(0, y);
    this.terminal.write(this.status);
    this.status = '';
  }

  private drawHorizontalLine(y: number, width: number) {
    this.terminal.cursorTo(0, y);
    this.terminal.write('_'.repeat(width));
  }
}
