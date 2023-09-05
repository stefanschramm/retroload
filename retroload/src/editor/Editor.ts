import {View, type ViewWidthChangeListener} from './View.js';
import {type EditorState} from './EditorState.js';
import {type InputActionListener, InputHandler} from './InputHandler.js';
import {WavFile} from './WavFile.js';

export class Editor implements InputActionListener, ViewWidthChangeListener {
  private readonly view: View;
  private readonly inputHandler: InputHandler;
  private readonly state: EditorState;
  private readonly file = new WavFile();

  constructor() {
    this.state = {
      viewOffset: 0,
      editRange: [40, 40],
      samples: [],
      changes: {},
      viewWidth: 100,
    };
    this.view = new View(process.stdout, this.state, this);
    this.inputHandler = new InputHandler(process.stdin, this);
  }

  public run(): void {
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
    this.view.setStatus('Changes have been written.');
    this.view.redraw();
  }

  public goTo(): void {
    // TODO
    this.view.setStatus('GoTo not yet implemented. :/');
    this.view.redraw();
  }

  public goLeft(): void {
    this.state.editRange[1] = this.state.editRange[0];
    if (this.state.viewOffset > 0) {
      this.state.viewOffset--;
    }
    if (this.state.editRange[0] > 0) {
      this.state.editRange[0]--;
      this.state.editRange[1]--;
    }
    this.loadVisibleSamples();
    this.view.redraw();
  }

  public goRight(): void {
    this.state.editRange[0] = this.state.editRange[1];
    if (this.state.viewOffset + this.state.viewWidth < this.file.sampleCount) {
      this.state.viewOffset++;
    }
    if (this.state.editRange[1] < this.file.sampleCount) {
      this.state.editRange[0]++;
      this.state.editRange[1]++;
    }
    this.loadVisibleSamples();
    this.view.redraw();
  }

  public extendEditRangeLeft(): void {
    if (this.state.editRange[0] > 0) {
      this.state.editRange[0]--;
    }
    this.view.redraw();
  }

  public extendEditRangeRight(): void {
    if (this.state.editRange[1] < this.file.sampleCount) {
      this.state.editRange[1]++;
    }
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

  public unknownKey(_keyName: string): void {
    this.view.setStatus('Unknown command. Valid commands: g(oto), q(uit), r(eload), s(ave)');
    this.view.redraw();
  }

  public onViewWidthChange(newWidth: number): void {
    this.state.viewWidth = newWidth;
  }

  private loadVisibleSamples(): void {
    this.state.samples = [];
    // TODO: take care of this.file.sampleCount
    for (let x = this.state.viewOffset; x < this.state.viewOffset + this.state.viewWidth; x++) {
      this.state.samples.push(this.file.getSample(x));
    }
  }

  private modifySamples(difference: number): void {
    for (let x = this.state.editRange[0]; x <= this.state.editRange[1]; x++) {
      const previousValue = this.state.changes[x] ?? this.file.getSample(x); // TODO: use this.state.samples instead? or can we change invisible samples?
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

const e = new Editor();
e.run();

// arguments:
// filename
// -c <channel>
// -g <sample> (go to sample)
