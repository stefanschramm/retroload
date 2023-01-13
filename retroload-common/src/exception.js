export class FormatAutodetectionFailedError extends Error {
  constructor() {
    super('Unable to autodetect input file format. Please select format manually.');
  }
}

export class FormatNotFoundError extends Error {
  constructor(format) {
    super(`Specified format "${format}" not found.`);
  }
}

export class TargetMachineNotSpecifiedError extends Error {
  constructor(format) {
    super(`Format "${format}" allows loading for multiple target machine. Please specify target machine type.`);
  }
}

export class TargetMachineNotFoundError extends Error {
  constructor(machine, format) {
    super(`Specified machine type "${machine}" not found for format "${format}".`);
  }
}

export class MissingOptionsError extends Error {
  constructor(missingOptions) {
    const optionList = missingOptions.map((o) => o.key);
    super(`The following options are required: ${optionList.join(', ')}`);
  }
}

export class InvalidArgumentError extends Error {
  constructor(optionName, message) {
    super(message);
    this.optionName = optionName;
  }
}

/**
 * Error that is caused by an invalid implementation of a format or adapter or the framework itself
 */
export class InternalError extends Error {
}
