const defaultVerbosity = 1;
let verbosity = defaultVerbosity;
let handler = console;

export class Logger {
  public static setVerbosity(v: number) {
    verbosity = v;
  }

  public static setHandler(h: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    handler = h;
  }

  public static resetVebosity() {
    verbosity = defaultVerbosity;
  }

  public static resetHandler() {
    handler = console;
  }

  public static error(...args: string[]) {
    handler.error(...args);
  }

  public static info(...args: string[]) {
    if (verbosity >= 1) {
      handler.info(...args);
    }
  }

  public static log(...args: string[]) {
    if (verbosity >= 2) {
      handler.log(...args);
    }
  }

  public static debug(...args: string[]) {
    if (verbosity >= 3) {
      handler.debug(...args);
    }
  }
}
