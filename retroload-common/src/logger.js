const verbosity = 1;

export class Logger {
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
