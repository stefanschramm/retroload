import Adapters from './AdapterProvider.js';
import {BufferAccess} from '../common/BufferAccess.js';

test('Adapter provider lists adapters', () => {
  expect(Adapters.length).toBeGreaterThan(0);
});

describe.each(Adapters.map((a) => [a.label, a]))('%s', (_name, a) => {
  const exampleBa = BufferAccess.create(8);

  test('identify function runs', () => {
    const identification = a.identify('example.txt', exampleBa);
    expect(['boolean', 'undefined']).toContain(typeof identification.filename);
    expect(['boolean', 'undefined']).toContain(typeof identification.header);
  });
});

test('Format identifiers are unique', () => {
  const formatNames = [];
  for (const a of Adapters) {
    expect(formatNames).not.toContain(a.name);
    formatNames.push(a.name);
  }
});
