import {View, type ViewWidthChangeListener} from './View.js';
import {SelectionStart, type EditorState} from './EditorState.js';
import {type InputActionListener, InputHandler, type Direction} from './InputHandler.js';
import {type WavFile} from './WavFile.js';

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
    if (goTo !== undefined) {
      if (goTo > this.file.sampleCount || goTo < 0) {
        throw new Error(`Unable to go to sample ${goTo} because it's out of range. File has ${this.file.sampleCount} samples.`);
      }
      this.state.viewOffset = goTo - Math.ceil(this.state.viewWidth / 2); // TODO: check for position < 0
      this.state.editRange[0] = goTo;
      this.state.editRange[1] = goTo;
    }
    this.loadVisibleSamples();
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

  public changePosition(direction: Direction): void {
    this.state.editRange[0] += direction;
    this.state.editRange[1] += direction;
    if (this.state.selectionStart === SelectionStart.LEFT) {
      this.state.editRange[1] = this.state.editRange[0];
    } else if (this.state.selectionStart === SelectionStart.RIGHT) {
      this.state.editRange[0] = this.state.editRange[1];
    }
    this.state.selectionStart = SelectionStart.NONE;
    this.restrictRanges();
    this.view.redraw();
  }

  public changePage(direction: Direction): void {
    this.state.viewOffset += direction * this.state.viewWidth;
    this.state.editRange[0] = Math.floor(this.state.viewOffset + this.state.viewWidth / 2);
    this.state.editRange[1] = this.state.editRange[0];
    this.restrictRanges();
    this.loadVisibleSamples();
    this.view.redraw();
  }

  public modifySelection(direction: Direction): void {
    if (this.state.selectionStart === SelectionStart.NONE) {
      this.state.selectionStart = direction === -1 ? SelectionStart.LEFT : SelectionStart.RIGHT;
    }
    this.state.editRange[this.state.selectionStart] += direction;
    this.restrictRanges();
    this.view.redraw();
  }

  public increaseAmplitude(): void {
    this.modifySamples(1);
  }

  public decreaseAmplitude(): void {
    this.modifySamples(-1);
  }

  public reload(): void {
    const hadChanges = this.hasChanges();
    this.state.changes = {};
    this.file.reload();
    this.loadVisibleSamples();
    // TODO: sample count can change
    this.view.setStatus(hadChanges ? 'Changes were dismissed and file has been reloaded.' : 'File has been reloaded.');
    this.view.redraw();
  }

  public unknownKey(keyName: string): void {
    this.view.setStatus(`Unknown command (${keyName}). Valid commands: g(oto), q(uit), r(eload), s(ave)`);
    this.view.redraw();
  }

  public onViewWidthChange(newWidth: number): void {
    this.state.viewWidth = newWidth;
    // TODO: repositioning of viewOffset required?
    this.loadVisibleSamples(); // TODO: delay?
    this.view.redraw();
  }

  private restrictRanges(): void {
    if (this.state.editRange[0] > this.state.editRange[1]) {
      this.state.editRange[0] = this.state.editRange[1];
    }
    if (this.state.editRange[0] <= this.state.viewOffset) {
      this.state.editRange[0] = this.state.viewOffset;
    }
    if (this.state.editRange[1] > this.state.viewOffset + this.state.viewWidth) {
      // TODO: does not yet catch all situations
      this.state.editRange[1] = this.state.viewOffset + this.state.viewWidth;
    }
  }

  private loadVisibleSamples(): void {
    this.state.samples = this.file.getSamples(this.state.viewOffset, Math.min(this.state.viewWidth, this.file.sampleCount));
  }

  private modifySamples(difference: number): void {
    for (let x = this.state.editRange[0]; x <= this.state.editRange[1]; x++) {
      const previousValue = this.state.changes[x] ?? this.state.samples[this.state.viewOffset + x];
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
