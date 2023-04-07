/* eslint-disable @typescript-eslint/no-unsafe-argument */
const defaultVerbosity = 1;
let verbosity = defaultVerbosity;
let handler = console;

export class Logger {
  static setVerbosity(v: number) {
    verbosity = v;
  }

  static setHandler(h) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    handler = h;
  }

  static resetVebosity() {
    verbosity = defaultVerbosity;
  }

  static resetHandler() {
    handler = console;
  }

  static error(...args) {
    handler.error(...args);
  }

  static info(...args) {
    if (verbosity >= 1) {
      handler.info(...args);
    }
  }

  static log(...args) {
    if (verbosity >= 2) {
      handler.log(...args);
    }
  }

  static debug(...args) {
    if (verbosity >= 3) {
      handler.debug(...args);
    }
  }
}
