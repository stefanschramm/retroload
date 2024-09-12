const defaultVerbosity = 1;
let verbosity = defaultVerbosity;
let handler = console;

export class Logger {
  public static setVerbosity(v: number): void {
    verbosity = v;
  }

  public static setHandler(h: any): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    handler = h;
  }

  public static resetVebosity(): void {
    verbosity = defaultVerbosity;
  }

  public static resetHandler(): void {
    handler = console;
  }

  public static error(...args: string[]): void {
    handler.error(...args);
  }

  public static info(...args: string[]): void {
    if (verbosity >= 1) {
      handler.info(...args);
    }
  }

  public static log(...args: string[]): void {
    if (verbosity >= 2) {
      handler.log(...args);
    }
  }

  public static debug(...args: string[]): void {
    if (verbosity >= 3) {
      handler.debug(...args);
    }
  }
}
