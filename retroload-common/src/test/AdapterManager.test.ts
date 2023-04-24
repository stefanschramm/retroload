import * as AdapterManager from '../AdapterManager.js';
import {Logger} from '../Logger.js';
import {NullLoggerHandler} from '../NullLoggerHandler.js';
import {type OptionValues} from '../Options.js';
import {WaveRecorder} from '../recorder/WaveRecorder.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as examples from 'retroload-examples';
import {BufferAccess} from '../BufferAccess.js';

// Disable log output for more readable test output
Logger.setHandler(new NullLoggerHandler());

test('getAllAdapters returns non-empty list', () => {
  expect(AdapterManager.getAllAdapters().length).toBeGreaterThan(0);
  // Actual plausibility test of individual adapters is done in AdapterProvider test
});

test('getAllOptions returns options that have at least name, label, description and type set', () => {
  const options = AdapterManager.getAllOptions();
  expect(options.length).toBeGreaterThan(0);
  for (const o of options) {
    expect(typeof o.name).toBe('string');
    expect(typeof o.label).toBe('string');
    expect(typeof o.description).toBe('string');
    expect(typeof o.type).toBe('string');
    expect(['text', 'bool', 'enum']).toContain(o.type);
  }
});

test('identify returns undefined for unknown formats', () => {
  expect(AdapterManager.identify('example.xyz', BufferAccess.create(128))).toEqual(undefined);
});

describe('Encoding pipeline', () => {
  it.each(examples.getExamples() as Example[])(
    'returns correct hash for example %s',
    (example) => {
      const hash = encodeAndHash(example.getPath(), example.options);
      expect(hash).toBe(example.hash);
    },
  );
});

function encodeAndHash(file: string, options: OptionValues) {
  const recorder = new WaveRecorder();
  const data = fs.readFileSync(file);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  );
  const ba = new BufferAccess(arrayBuffer);
  if (!AdapterManager.encode(recorder, file, ba, options)) {
    Logger.error('Unable to decode ' + file);
    return false;
  }

  return hash(recorder.getBuffer());
}

function hash(data: Uint8Array) {
  return crypto.createHash('md5').update(data).digest('hex');
}

type Example = {
  options: OptionValues;
  getPath(): string;
  hash(hash: any): unknown;
};
