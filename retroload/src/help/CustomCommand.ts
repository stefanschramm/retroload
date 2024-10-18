import {Command, type Help} from 'commander';
import {CustomHelp} from './CustomHelp.js';
import {type AdapterDefinition} from 'retroload-lib';

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
