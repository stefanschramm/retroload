const defaultVerbosity = 1;
let verbosity = defaultVerbosity;

export class Logger {
  static setVerbosity(v) {
    verbosity = v;
  }

  static resetVebosity() {
    verbosity = defaultVerbosity;
  }

  static error(...args) {
    console.error(...args);
  }

  static info(...args) {
    if (verbosity >= 1) {
      console.info(...args);
    }
  }

  static log(...args) {
    if (verbosity >= 2) {
      console.log(...args);
    }
  }

  static debug(...args) {
    if (verbosity >= 3) {
      console.debug(...args);
    }
  }
}
