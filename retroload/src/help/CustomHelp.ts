import {type AdapterDefinition, type OptionDefinition} from 'retroload-lib';
import {type CustomCommand} from './CustomCommand.js';
import {Help} from 'commander';

export class CustomHelp extends Help {
  public constructor(
    private readonly adapters: AdapterDefinition[],
  ) {
    super();
  }

  public override formatHelp(cmd: CustomCommand, helper: Help): string {
    let output = super.formatHelp(cmd, helper);

    const adaptersSorted = this.adapters.sort((a, b) => a.label.localeCompare(b.label));

    const adapterList = adaptersSorted.map((adapter: AdapterDefinition) => {
      const adapterOptionsSorted = adapter.options.sort((a, b) => a.name.localeCompare(b.name));
      const adapterOptions = adapterOptionsSorted.map((option: OptionDefinition) => helper.formatItem(`  --${option.name}`, 20, option.description, helper));

      let adapterDetails = `  ${adapter.label} (${adapter.name})`;
      if (adapterOptions.length > 0) {
        adapterDetails += `\n\n${adapterOptions.join('\n')}`;
      }
      adapterDetails += '\n';

      return adapterDetails;
    });
    if (adapterList.length > 0) {
      output = `${output}\nSupported formats and their specific options:\n\n${adapterList.join('\n')}\n`;
    }

    return output;
  }
}
