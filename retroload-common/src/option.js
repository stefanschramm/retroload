export class Option {
  constructor(key, label, description, options = {}) {
    this.key = key;
    this.label = label;
    this.description = description;
    this.defaultValue = options.defaultValue;
    this.common = options.common ?? false;
    this.required = options.required ?? false;
    this.argument = options.argument;
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

export const ShortpilotOption = new Option('shortpilot', 'Short pilot', 'Use short pilot tone for faster start of loading', false, true, false);
