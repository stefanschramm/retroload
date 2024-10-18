import {Help} from 'commander';
import {type CustomCommand} from './CustomCommand.js';
import {type AdapterDefinition, type OptionDefinition} from 'retroload-lib';

export class CustomHelp extends Help {
  public constructor(
    private readonly adapters: AdapterDefinition[],
  ) {
    super();
  }

  public override formatHelp(cmd: CustomCommand, helper: Help): string {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2; // between term and description

    function formatItem(term: string, description: string): string {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
      }
      return term;
    }

    function formatList(textArray: string[]): string {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    let output = super.formatHelp(cmd, helper);

    const adaptersSorted = this.adapters.sort((a, b) => a.name.localeCompare(b.name));

    const adapterList = adaptersSorted.map((adapter: AdapterDefinition) => {
      const adapterOptionsSorted = adapter.options.sort((a, b) => a.name.localeCompare(b.name));
      const adapterOptions = adapterOptionsSorted.map((option: OptionDefinition) => formatItem(`  --${option.name}`, `${option.description}`));
      let adapterDetails = formatItem(`${adapter.name} (${adapter.internalName})`, '');
      if (adapterOptions.length > 0) {
        adapterDetails += '\n' + adapterOptions.join('\n');
      }
      adapterDetails += '\n';
      return adapterDetails;
    });
    if (adapterList.length > 0) {
      output = output + '\nSupported formats and their specific options:\n\n' + formatList(adapterList) + '\n';
    }

    return output;
  }
}
