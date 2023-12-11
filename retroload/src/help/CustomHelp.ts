import {Help} from 'commander';
import {type CustomCommand} from './CustomCommand.js';
import {type PublicOptionDefinition, type PublicAdapterDefinition} from 'retroload-lib/dist/cjs/index.js';

export class CustomHelp extends Help {
  constructor(
    private readonly adapters: PublicAdapterDefinition[],
  ) {
    super();
  }

  override formatHelp(cmd: CustomCommand, helper: Help): string {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2; // between term and description

    function formatItem(term: string, description: string) {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
      }
      return term;
    }

    function formatList(textArray: string[]) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    let output = super.formatHelp(cmd, helper);

    const adaptersSorted = this.adapters.sort((a, b) => a.name.localeCompare(b.name));

    const adapterList = adaptersSorted.map((adapter: PublicAdapterDefinition) => {
      const adapterOptionsSorted = adapter.options.sort((a, b) => a.name.localeCompare(b.name));
      const adapterOptions = adapterOptionsSorted.map((option: PublicOptionDefinition) => formatItem(`  --${option.name}`, `${option.description}`));
      let adapterDetails = formatItem(`${adapter.name} (${adapter.internalName})`, '');
      if (adapterOptions.length > 0) {
        adapterDetails += '\n' + adapterOptions.join('\n');
      }
      adapterDetails += '\n';
      return adapterDetails;
    });
    if (adapterList.length > 0) {
      output = output + '\nAvailable format adapters and their specific options:\n\n' + formatList(adapterList) + '\n';
    }

    return output;
  }
}
