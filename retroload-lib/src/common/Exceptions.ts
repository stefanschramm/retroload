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

export class FormatAutodetectionFailedError extends UsageError {
  constructor() {
    super('Unable to autodetect input file format. Please specify machine/format manually.');
  }
}

export class FormatNotFoundError extends UsageError {
  constructor(format: string) {
    super(`Specified format "${format}" not found.`);
  }
}

export class TargetMachineNotFoundError extends UsageError {
  constructor(machine: string, format: string | undefined) {
    if (format === undefined) {
      super(`Specified machine type "${machine}" not found.`);
    } else {
      super(`Specified machine type "${machine}" not found for format "${format}".`);
    }
  }
}

export class MissingOptionsError extends UsageError {
  constructor(missingOptions: OptionDefinition[]) {
    const optionList = missingOptions.map((o) => o.name);
    super(`The following options are required: ${optionList.join(', ')}`);
  }
}

export class InvalidArgumentError extends UsageError {
  optionName: string;
  constructor(optionName: string, message: string) {
    super(message);
    this.optionName = optionName;
  }
}
