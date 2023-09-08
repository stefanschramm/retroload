import readline from 'readline';

export type InputActionListener = {
  quit(): void;
  save(): void;
  goTo(): void;
  changePosition(direction: Direction): void;
  changePage(direction: Direction): void;
  modifySelection(direction: Direction): void;
  increaseAmplitude(): void;
  decreaseAmplitude(): void;
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
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

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
          this.listener.goTo();
          break;
        case 'left':
          if (key.shift === true) {
            this.listener.modifySelection(-1);
          } else {
            this.listener.changePosition(-1);
          }
          break;
        case 'right':
          if (key.shift === true) {
            this.listener.modifySelection(1);
          } else {
            this.listener.changePosition(1);
          }
          break;
        case 'pageup':
          this.listener.changePage(-1);
          break;
        case 'pagedown':
          this.listener.changePage(1);
          break;
        case 'up':
          this.listener.increaseAmplitude();
          break;
        case 'down':
          this.listener.decreaseAmplitude();
          break;
        default:
          this.listener.unknownKey(key.name as string);
      }
    });
  }
}
