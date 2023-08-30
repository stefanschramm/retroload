import {adapters} from './AdapterProvider.js';
import {BufferAccess} from '../common/BufferAccess.js';

test('Adapter provider lists adapters', () => {
  expect(adapters.length).toBeGreaterThan(0);
});

describe.each(adapters.map((a) => [a.name, a]))('%s', (_name, a) => {
  const exampleBa = BufferAccess.create(8);

  test('identify function runs', () => {
    const identification = a.identify('example.txt', exampleBa);
    expect(['boolean', 'undefined']).toContain(typeof identification.filename);
    expect(['boolean', 'undefined']).toContain(typeof identification.header);
  });
});

test('Format identifiers are unique', () => {
  const formatNames = [];
  for (const a of adapters) {
    expect(formatNames).not.toContain(a.internalName);
    formatNames.push(a.internalName);
  }
});
