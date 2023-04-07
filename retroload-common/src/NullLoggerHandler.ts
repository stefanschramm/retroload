/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * Handler for Logger that just ignores all logging output
 */
export class NullLoggerHandler {
  error(..._args: string[]) {
  }

  info(..._args: string[]) {
  }

  log(..._args: string[]) {
  }

  debug(..._args: string[]) {
  }
}
