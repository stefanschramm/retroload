/**
 * Handler for Logger that just ignores all logging output
 */
export class NullLoggerHandler {
  // eslint-disable-next-line no-empty-function
  public error(..._args: string[]): void {
  }

  // eslint-disable-next-line no-empty-function
  public info(..._args: string[]): void {
  }

  // eslint-disable-next-line no-empty-function
  public log(..._args: string[]): void {
  }

  // eslint-disable-next-line no-empty-function
  public debug(..._args: string[]): void {
  }
}
