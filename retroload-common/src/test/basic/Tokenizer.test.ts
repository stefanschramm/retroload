import fs from 'fs';
import {tokenizers} from '../../basic/TokenizerProvider.js';

const FIXTURES_DIR = __dirname + '/fixtures';
const FIXTURES = ['for'];

describe.each(tokenizers.map((t) => [t.name, t]))('%s', (name, t) => {
  test('provides name', () => {
    expect(typeof t.getName()).toBe('string');
  });

  test('provides extension', () => {
    expect(typeof t.getExtension()).toBe('string');
  });

  test('provides tokenize function', () => {
    expect(typeof t.tokenize).toBe('function');
  });

  test.each(FIXTURES)('Example code: %s.txt', (fixture) => {
    const source = fs.readFileSync(`${FIXTURES_DIR}/${fixture}.txt`).toString();
    const tokenized = t.tokenize(source);
    const expected = fs.readFileSync(`${FIXTURES_DIR}/${t.getName()}/${fixture}.${t.getExtension()}`);
    expect(uInt8ArrayEqual(new Uint8Array(expected), tokenized.asUint8Array())).toBe(true);
  });
});

/**
 * Check if the passed arrays have the same length and content.
 */
function uInt8ArrayEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
