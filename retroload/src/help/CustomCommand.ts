import {Command, type Help} from 'commander';
import {type AdapterDefinition} from 'retroload-lib';
import {CustomHelp} from './CustomHelp.js';

export class CustomCommand extends Command {
  public constructor(
    private readonly adapters: AdapterDefinition[],
  ) {
    super(undefined);
  }

  public override createHelp(): Help {
    return new CustomHelp(this.adapters);
  }
}
