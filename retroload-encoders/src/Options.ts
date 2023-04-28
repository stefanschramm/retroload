import {InternalError, InvalidArgumentError} from './Exceptions.js';

/**
 * Properties common to all OptionDefinitions
 */
type BaseOption = {
  /**
   * Internal name of option and name in CLI
   */
  name: string;
  /**
   * Field label in GUI implementations
   */
  label: string;
  /**
   * Description displayed in --help of CLI and in GUI implementations
   */
  description: string;
  /**
   * Wether the option is used by several adapters
   */
  common: boolean;
};

/**
 * Option that represents a flag (without argument, for example a checkbox in GUI implementations)
 */
export type FlagOptionDefinition = BaseOption & {
  type: 'bool';
};

/**
 * Option with argument that parses to type T
 */
export type ArgumentOptionDefinition<T> = BaseOption & {
  type: 'text';
  /**
   * List of possible values for options of 'text' type. Will render as dropdown in GUI implementations.
   */
  enum?: string[];
  /**
   * Name of the argument (displayed in --help of CLI and possibly as placeholder in GUI implementations)
   */
  argument?: string;
  /**
   * Wether the option is required for the adapter
   */
  required: boolean;
  /**
   * Function that validates and parses the option. Can throw exceptions on parsing errors. Will receive empty string if option was not set.
   */
  parse: (value: string) => T;
};

export type OptionDefinition = FlagOptionDefinition | ArgumentOptionDefinition<any>;

export type OptionValues = Record<string, string | boolean>;

/**
 * Option container holds options passed to the adapters (command line options or form data from UI) and provides methods to access them by OptionDefinitions.
 */
export class OptionContainer {
  private readonly values: OptionValues;

  constructor(values: OptionValues) {
    // TODO: explicitly check types during runtime
    this.values = values;
  }

  public getArgument<T>(optionDefinition: ArgumentOptionDefinition<T>): T {
    const value = this.values[optionDefinition.name];
    if (value !== undefined && typeof value !== 'string') {
      throw new InternalError(`Got invalid type (${typeof value}) for option ${optionDefinition.name}`);
    }
    // TODO: If enum is set, check if value matches an entry.
    return optionDefinition.parse(value ?? '');
  }

  public isFlagSet(optionDefinition: FlagOptionDefinition): boolean {
    const value = this.values[optionDefinition.name];
    if (value === undefined) {
      return false;
    }
    if (typeof value !== 'boolean') {
      throw new InternalError(`Got invalid type for option ${optionDefinition.name}`);
    }
    return value;
  }
}

// TODO: does individual refinement contradict with common options?
// TODO: allow multiple definitions of options when at least one common option exists? where will it be defined?
// TODO: add adapterSpecificDescription?
// TODO: UI might use parse function to check for exceptions directly?
// export const entryOptionRequiredDefinition = {
//   ...entryOptionDefinition,
//   required: true,
// };

// Some common options used by several Adapters/Encoders

export const shortpilotOption: FlagOptionDefinition = {
  name: 'shortpilot',
  label: 'Short pilot',
  description: 'Use short pilot tone for faster start of loading',
  common: true,
  type: 'bool',
};

export const nameOption: ArgumentOptionDefinition<string> = {
  name: 'name',
  label: 'File name',
  description: 'File name for tape record. Different machines have different constraints for file names.',
  argument: 'name',
  common: true,
  required: false,
  type: 'text',
  parse: (v) => v,
};

export const loadOption: ArgumentOptionDefinition<number | undefined> = {
  name: 'load',
  label: 'Load address',
  description: 'Address (hexadecimal 16-bit number) where to load the program to',
  argument: 'address',
  common: true,
  required: false,
  type: 'text',
  parse(v) {
    if (v === undefined) {
      return undefined;
    }
    const address = parseInt(v, 16);
    if (isNaN(address) || address < 0 || address > 0xffff) {
      throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    return address;
  },
};

export const entryOption: ArgumentOptionDefinition<number | undefined> = {
  name: 'entry',
  label: 'Entry address',
  description: 'Address (hexadecimal 16-bit number) of entry point of program (in memory)',
  argument: 'address',
  common: true,
  required: false,
  type: 'text',
  parse(v) {
    if (v === undefined) {
      return undefined;
    }
    const address = parseInt(v, 16);
    if (isNaN(address) || address < 0 || address > 0xffff) {
      throw new InvalidArgumentError('entry', 'Option entry is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
    }

    return address;
  },
};
