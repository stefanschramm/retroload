import {View, type ViewWidthChangeListener} from './View.js';
import {SelectionStart, type EditorState} from './EditorState.js';
import {type InputActionListener, InputHandler, type Direction} from './InputHandler.js';
import {type WavFile} from './WavFile.js';

const fastSteps = 10;

export class Editor implements InputActionListener, ViewWidthChangeListener {
  private readonly view: View;
  private readonly inputHandler: InputHandler;
  private readonly state: EditorState;

  constructor(
    private readonly file: WavFile,
  ) {
    this.state = {
      viewOffset: 0,
      editRange: [40, 40],
      samples: [],
      changes: {},
      viewWidth: 100,
      selectionStart: SelectionStart.NONE,
    };
    this.view = new View(process.stdout, this.state, this);
    this.inputHandler = new InputHandler(process.stdin, this);
  }

  public run(goTo: number | undefined): void {
    this.state.viewWidth = this.view.getViewWidth();
    let initialEditPosition = 0;
    if (goTo !== undefined) {
      if (goTo > this.file.getSampleCount() || goTo < 0) {
        throw new Error(`Unable to go to sample ${goTo} because it's out of range. File has ${this.file.getSampleCount()} samples.`);
      }
      initialEditPosition = goTo;
    }
    this.state.editRange[0] = initialEditPosition;
    this.state.editRange[1] = initialEditPosition;
    this.state.viewOffset = Math.max(0, initialEditPosition - Math.ceil(this.state.viewWidth / 2));
    this.loadVisibleSamples();
    this.updateTitle();
    this.inputHandler.run();
    this.view.redraw();
  }

  public quit(): void {
    process.exit(0);
  }

  public save(): void {
    if (!this.hasChanges()) {
      this.view.setStatus('There are no changes that can be saved.');
      this.view.redraw();
      return;
    }
    this.file.write(this.state.changes);
    this.state.changes = {};
    this.reload();
    this.view.setStatus('Changes have been written.');
    this.view.redraw();
  }

  public goTo(): void {
    // TODO
    this.view.setStatus('GoTo not yet implemented. :/');
    this.view.redraw();
  }

  public changePosition(direction: Direction, fast: boolean): void {
    this.state.editRange[0] += direction * (fast ? fastSteps : 1);
    this.state.editRange[1] += direction * (fast ? fastSteps : 1);
    if (this.state.selectionStart === SelectionStart.LEFT) {
      this.state.editRange[1] = this.state.editRange[0];
    } else if (this.state.selectionStart === SelectionStart.RIGHT) {
      this.state.editRange[0] = this.state.editRange[1];
    }
    this.state.selectionStart = SelectionStart.NONE;
    this.restrictRanges();
    this.view.redraw();
  }

  public changePage(direction: Direction, fast: boolean): void {
    this.state.viewOffset += direction * this.state.viewWidth * (fast ? fastSteps : 1);
    this.state.editRange[0] = Math.floor(this.state.viewOffset + this.state.viewWidth / 2);
    this.state.editRange[1] = this.state.editRange[0];
    this.restrictRanges();
    this.loadVisibleSamples();
    this.view.redraw();
  }

  public modifySelection(direction: Direction, fast: boolean): void {
    if (this.state.selectionStart === SelectionStart.NONE) {
      this.state.selectionStart = direction === -1 ? SelectionStart.LEFT : SelectionStart.RIGHT;
    }
    this.state.editRange[this.state.selectionStart] += direction * (fast ? fastSteps : 1);
    this.restrictRanges();
    const samples = this.state.editRange[1] - this.state.editRange[0];
    const frequency = this.file.getSampleRate() / samples;
    this.view.setStatus(`Selection: ${samples} samples = ${frequency.toFixed(2)} Hz`);
    this.view.redraw();
  }

  public changeAmplitude(direction: Direction, fast: boolean): void {
    this.modifySamples(direction * (fast ? fastSteps : 1));
  }

  public reload(): void {
    const hadChanges = this.hasChanges();
    this.state.changes = {};
    this.file.reload();
    this.loadVisibleSamples();
    this.restrictRanges();
    this.view.setStatus(hadChanges ? 'Changes were dismissed and file has been reloaded.' : 'File has been reloaded.');
    this.updateTitle();
    this.view.redraw();
  }

  public unknownKey(keyName: string): void {
    this.view.setStatus(`Unknown command (${keyName}). Valid commands: g(oto), q(uit), r(eload), s(ave)`);
    this.view.redraw();
  }

  public onViewWidthChange(newWidth: number): void {
    this.state.viewWidth = newWidth;
    this.restrictRanges();
    this.loadVisibleSamples();
    this.view.redraw();
  }

  private restrictRanges(): void {
    if (this.state.viewOffset < 0) {
      this.state.viewOffset = 0;
    }
    if (this.state.viewOffset > this.file.getSampleCount()) {
      this.state.viewOffset = Math.max(0, this.file.getSampleCount() - this.state.viewWidth);
    }
    if (this.state.editRange[0] > this.state.editRange[1]) {
      this.state.editRange[0] = this.state.editRange[1];
    }
    // force edit range to be within view
    if (this.state.editRange[0] < this.state.viewOffset) {
      this.state.editRange[0] = this.state.viewOffset;
    }
    if (this.state.editRange[1] < this.state.viewOffset) {
      this.state.editRange[1] = this.state.viewOffset;
    }
    if (this.state.editRange[1] > this.state.viewOffset + this.state.viewWidth) {
      this.state.editRange[1] = this.state.viewOffset + this.state.viewWidth;
    }
    if (this.state.editRange[0] > this.state.viewOffset + this.state.viewWidth) {
      this.state.editRange[0] = this.state.viewOffset + this.state.viewWidth;
    }
    if (this.state.editRange[0] >= this.file.getSampleCount()) {
      this.state.editRange[0] = this.file.getSampleCount() - 1;
    }
    if (this.state.editRange[1] >= this.file.getSampleCount()) {
      this.state.editRange[1] = this.file.getSampleCount() - 1;
    }
  }

  private updateTitle(): void {
    const lengthSeconds = Math.round(this.file.getSampleCount() / this.file.getSampleRate());
    this.view.setTitle(`${this.file.getFileName()} - Channels: ${this.file.getChannelCount()} Samples: ${this.file.getSampleCount()} Sample rate: ${this.file.getSampleRate()} Length: ${lengthSeconds} s`);
  }

  private loadVisibleSamples(): void {
    this.state.samples = this.file.getSamples(this.state.viewOffset, Math.min(this.state.viewWidth, this.file.getSampleCount()));
  }

  private modifySamples(difference: number): void {
    console.log(difference);
    for (let x = this.state.editRange[0]; x <= this.state.editRange[1]; x++) {
      const previousValue = this.state.changes[x] ?? this.state.samples[x - this.state.viewOffset];
      let newValue = previousValue + difference;
      newValue = newValue > 0xff ? 0xff : newValue;
      newValue = newValue < 0 ? 0 : newValue;
      this.state.changes[x] = newValue;
    }
    const n = this.state.editRange[1] - this.state.editRange[0] + 1;
    this.view.setStatus(n === 1 ? 'Modified one sample.' : `Modified ${n} samples.`);
    this.view.redraw();
  }

  private hasChanges(): boolean {
    return Object.keys(this.state.changes).length > 0;
  }
}
