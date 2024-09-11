import {Command, type Help} from 'commander';
import {CustomHelp} from './CustomHelp.js';
import {type PublicAdapterDefinition} from 'retroload-lib';

export class CustomCommand extends Command {
  public constructor(
    private readonly adapters: PublicAdapterDefinition[],
  ) {
    super(undefined);
  }

  public override createHelp(): Help {
    return new CustomHelp(this.adapters);
  }
}
