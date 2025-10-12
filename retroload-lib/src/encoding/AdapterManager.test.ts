import * as AdapterManager from './AdapterManager.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import {type InternalExampleDefinition, getExamplesInternal, getLocalPath} from '../Examples.js';
import {describe, expect, it, test} from 'vitest';
import {BufferAccess} from '../common/BufferAccess.js';
import {Logger} from '../common/logging/Logger.js';
import {NullLoggerHandler} from '../common/logging/NullLoggerHandler.js';
import {type OptionValues} from './Options.js';

// Disable log output for more readable test output
Logger.setHandler(new NullLoggerHandler());

test('getAllAdapters returns non-empty list', () => {
  expect(AdapterManager.getEncodingAdapters().length).toBeGreaterThan(0);
  // Actual plausibility test of individual adapters is done in AdapterProvider test
});

test('getAllOptions returns options that have at least name, label, description and type set', () => {
  const options = AdapterManager.getAllEncodingOptions();
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
  expect(AdapterManager.identify(BufferAccess.create(128).asUint8Array(), 'example.xyz')).toEqual(undefined);
});

describe('Encoding pipeline returns correct hashes', () => {
  it.each(getExamplesInternal().map((e) => ({label: getTestLabel(e), definition: e})))(
    'example $label',
    (example) => {
      const actualHash = encodeAndHash(getLocalPath(example.definition), example.definition.options);
      expect(actualHash).toBe(example.definition.hash);
    },
  );
});

function getTestLabel(example: InternalExampleDefinition): string {
  return `${example.path}, options: ${JSON.stringify(example.options)}`;
}

function encodeAndHash(file: string, options: OptionValues): string | false {
  // const recorder = new WaveRecorder();
  const buffer = fs.readFileSync(file);
  const data = BufferAccess.createFromNodeBuffer(buffer).asUint8Array();

  let adapterIdentifier: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof options['format'] === 'string' && options['format'] !== undefined) {
    adapterIdentifier = options['format'];
  } else {
    adapterIdentifier = AdapterManager.identify(data, file);
  }
  if (adapterIdentifier === undefined) {
    Logger.error(`Unable to identify ${file}`);
    return false;
  }
  const result = AdapterManager.encodeUint8Wav(adapterIdentifier, data, options);

  return hash(result.data);
}

function hash(data: Uint8Array): string {
  return crypto.createHash('md5').update(data).digest('hex');
}
