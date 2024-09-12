/* eslint-disable @typescript-eslint/no-empty-function */
/**
 * Handler for Logger that just ignores all logging output
 */
export class NullLoggerHandler {
  public error(..._args: string[]): void {
  }

  public info(..._args: string[]): void {
  }

  public log(..._args: string[]): void {
  }

  public debug(..._args: string[]): void {
  }
}
