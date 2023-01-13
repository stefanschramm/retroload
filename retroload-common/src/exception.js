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

export class FormatAutodetectionFailedError extends UsageError {
  constructor() {
    super('Unable to autodetect input file format. Please select format manually.');
  }
}

export class FormatNotFoundError extends UsageError {
  constructor(format) {
    super(`Specified format "${format}" not found.`);
  }
}

export class TargetMachineNotSpecifiedError extends UsageError {
  constructor(format) {
    super(`Format "${format}" allows loading for multiple target machine. Please specify target machine type.`);
  }
}

export class TargetMachineNotFoundError extends UsageError {
  constructor(machine, format) {
    super(`Specified machine type "${machine}" not found for format "${format}".`);
  }
}

export class MissingOptionsError extends UsageError {
  constructor(missingOptions) {
    const optionList = missingOptions.map((o) => o.key);
    super(`The following options are required: ${optionList.join(', ')}`);
  }
}

export class InvalidArgumentError extends UsageError {
  constructor(optionName, message) {
    super(message);
    this.optionName = optionName;
  }
}
