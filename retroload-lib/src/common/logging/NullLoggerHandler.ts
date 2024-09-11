/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * Handler for Logger that just ignores all logging output
 */
export class NullLoggerHandler {
  public error(..._args: string[]) {
  }

  public info(..._args: string[]) {
  }

  public log(..._args: string[]) {
  }

  public debug(..._args: string[]) {
  }
}
