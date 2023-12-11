import {Command, type Help} from 'commander';
import {CustomHelp} from './CustomHelp.js';
import {type PublicAdapterDefinition} from 'retroload-lib';

export class CustomCommand extends Command {
  constructor(
    private readonly adapters: PublicAdapterDefinition[],
  ) {
    super(undefined);
  }

  override createHelp(): Help {
    return new CustomHelp(this.adapters);
  }
}
