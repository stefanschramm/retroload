import {getAllOptions} from '../AdapterManager.js';
import {Option} from '../Options.js';

test('Adapter manager returns options that have at least key, label and description set', () => {
  const options = getAllOptions();
  expect(options.length).toBeGreaterThan(0);
  for (const o of options) {
    expect(o).toBeInstanceOf(Option);
    expect(typeof o.key).toBe('string');
    expect(typeof o.label).toBe('string');
    expect(typeof o.description).toBe('string');
    expect(typeof o.getCommanderFlagsString()).toBe('string');
  }
});
