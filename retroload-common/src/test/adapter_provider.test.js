import {adapters} from '../adapter_provider.js';

test('Adapter provider lists adapters', () => {
  expect(adapters.length).toBeGreaterThan(0);
});

describe.each(adapters.map((a) => [a.name, a]))('%s', (name, a) => {
  test('provides target name', () => {
    expect(typeof a.getTargetName()).toBe('string');
  });

  /*
  test('provides internal name', () => {
    expect(typeof a.getInternalName()).toBe('string');
  });

  test('provides name', () => {
    expect(typeof a.getName()).toBe('string');
  });
  */

  test('provides option list', () => {
    expect(Array.isArray(a.getOptions())).toBe(true);
  });

  test('provides encode function', () => {
    expect(typeof a.encode).toBe('function');
  });

  /*
  test('provides supports function', () => {
    expect(typeof a.supports).toBe('function');
  });
  */
});
