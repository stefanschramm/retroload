export class Option {
  constructor(key, label, description, options = {}) {
    this.key = key;
    this.label = label;
    this.description = description;
    this.defaultValue = options.defaultValue;
    this.common = options.common ?? false;
    this.required = options.required ?? false;
    this.argument = options.argument;
    this.type = options.type ?? 'text'; // type for web interface (text/bool/enum)
    this.enum = options.enum ?? []; // possible options for enums
  }

  getCommanderFlagsString() {
    if (this.argument !== undefined) {
      return `--${this.key} <${this.argument}>`;
    } else {
      return `--${this.key}`;
    }
  }
}

// Some common options used by several Adapters/Encoders

export const ShortpilotOption = new Option(
    'shortpilot',
    'Short pilot',
    'Use short pilot tone for faster start of loading',
    {
      defaultValue: false,
      common: true,
      required: false,
      type: 'bool',
    },
);

export const NameOption = new Option(
    'name',
    'File name',
    'File name for tape record. Different machines have different constraints for file names.',
    {
      argument: 'name',
      common: true,
      required: false,
      defaultValue: '',
      type: 'text',
    },
);

export const LoadOption = new Option(
    'load',
    'Load address',
    'Address (hexadecimal 16-bit number) where to load the program to',
    {
      argument: 'address',
      common: true,
      required: false,
      type: 'text',
    },
);

export const EntryOption = new Option(
    'entry',
    'Entry address',
    'Address (hexadecimal 16-bit number) of entry point of program (in memory)',
    {
      argument: 'address',
      common: true,
      required: false,
      type: 'text',
    },
);
