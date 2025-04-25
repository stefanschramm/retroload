import {describe, expect, it} from 'vitest';
import {AdapterDefinition} from './encoding/adapter/AdapterDefinition.js';
import adapters from './encoding/Adapters.js';
import {getExamplesInternal} from './Examples.js';

describe('Examples have valid adapter names', () => {
  const adapterNames = adapters.map((adapter: AdapterDefinition) => adapter.name);

  it.each(getExamplesInternal().map((e) => ({label: e.adapter, definition: e})))(
    'example $label',
    (example) => {
      expect(adapterNames).toContain(example.definition.adapter);
    },
  );
});
