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
  constructor(format) {
    super(`Specified format "${format}" not found.`);
  }
}

export class TargetMachineNotFoundError extends UsageError {
  constructor(machine, format) {
    if (format === undefined) {
      super(`Specified machine type "${machine}" not found.`);
    } else {
      super(`Specified machine type "${machine}" not found for format "${format}".`);
    }
  }
}

export class MissingOptionsError extends UsageError {
  constructor(missingOptions) {
    const optionList = missingOptions.map((o) => o.key);
    super(`The following options are required: ${optionList.join(', ')}`);
  }
}

export class InvalidArgumentError extends UsageError {
  optionName: any;
  constructor(optionName, message) {
    super(message);
    this.optionName = optionName;
  }
}
