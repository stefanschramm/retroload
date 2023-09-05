import readline from 'readline';

export type InputActionListener = {
  quit(): void;
  save(): void;
  goTo(): void;
  goLeft(): void;
  goRight(): void;
  extendEditRangeLeft(): void;
  extendEditRangeRight(): void;
  increaseAmplitude(): void;
  decreaseAmplitude(): void;
  reload(): void;
  unknownKey(_keyName: string): void;
};

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
          if (key.shift) {
            this.listener.extendEditRangeLeft();
          } else {
            this.listener.goLeft();
          }
          break;
        case 'right':
          if (key.shift) {
            this.listener.extendEditRangeRight();
          } else {
            this.listener.goRight();
          }
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
