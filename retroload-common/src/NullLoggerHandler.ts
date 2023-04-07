/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * Handler for Logger that just ignores all logging output
 */
export class NullLoggerHandler {
  error(...args) {
  }

  info(...args) {
  }

  log(...args) {
  }

  debug(...args) {
  }
}
