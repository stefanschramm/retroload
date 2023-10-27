import readline from 'readline';

export type InputActionListener = {
  quit(): void;
  save(): void;
  goTo(): void;
  changePosition(direction: Direction, fast: boolean): void;
  changePage(direction: Direction, fast: boolean): void;
  modifySelection(direction: Direction, fast: boolean): void;
  changeAmplitude(direction: Direction, fast: boolean): void;
  reload(): void;
  unknownKey(keyName: string): void;
};

export type Direction = -1 | 1;

export class InputHandler {
  constructor(
    private readonly stdin: NodeJS.ReadStream,
    private readonly listener: InputActionListener,
  ) {}

  public run() {
    readline.emitKeypressEvents(this.stdin);

    if (!process.stdin.isTTY) {
      throw new Error('Standard input is expected to be a terminal.');
    }

    process.stdin.setRawMode(true);

    process.stdin.on('keypress', (_chunk, key) => {
      switch (key.name) {
        case 'escape':
        case 'q':
          this.listener.quit();
          break;
        case 'r':
          this.listener.reload();
          break;
        case 's':
          this.listener.save();
          break;
        case 'g':
          this.readInput();
          // this.listener.goTo();
          break;
        case 'left':
          if (key.shift === true) {
            this.listener.modifySelection(-1, key.ctrl === true);
          } else {
            this.listener.changePosition(-1, key.ctrl === true);
          }
          break;
        case 'right':
          if (key.shift === true) {
            this.listener.modifySelection(1, key.ctrl === true);
          } else {
            this.listener.changePosition(1, key.ctrl === true);
          }
          break;
        case 'pageup':
          this.listener.changePage(-1, key.ctrl === true);
          break;
        case 'pagedown':
          this.listener.changePage(1, key.ctrl === true);
          break;
        case 'up':
          this.listener.changeAmplitude(1, key.ctrl === true);
          break;
        case 'down':
          this.listener.changeAmplitude(-1, key.ctrl === true);
          break;
          // TODO
          // case 'enter':
          //   console.log(_chunk, key);
          //   break;
        default:
          this.listener.unknownKey(key.name as string);
      }
    });
  }

  private readInput(): void {
    // TODO
    // process.stdin.setRawMode(false);
    // const rl = readline.createInterface({input: this.stdin});
    // rl.question('What do you think of Node.js? ');
    // const answer =
    // console.log(answer);
    // process.stdin.setRawMode(true);
    // process.exit(0);
  }
}
