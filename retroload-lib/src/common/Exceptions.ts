import {type OptionDefinition} from '../encoding/Options';

/**
 * Error that is usually caused by invalid usage
 */
export class UsageError extends Error {
}

/**
 * Error that is caused by an invalid implementation of a format or adapter or the framework itself
 */
export class InternalError extends Error {
}

export class InputDataError extends UsageError {
}

export class FormatNotFoundError extends UsageError {
  public constructor(format: string) {
    super(`Specified format "${format}" not found.`);
  }
}

export class MissingOptionsError extends UsageError {
  public constructor(missingOptions: OptionDefinition[]) {
    const optionList = missingOptions.map((o) => o.name);
    super(`The following options are required: ${optionList.join(', ')}`);
  }
}

export class InvalidArgumentError extends UsageError {
  public readonly optionName: string;

  public constructor(optionName: string, message: string) {
    super(message);
    this.optionName = optionName;
  }
}
