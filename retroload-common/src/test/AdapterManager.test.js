import * as AdapterManager from '../AdapterManager.js';
import {Logger} from '../Logger.js';
import {NullLoggerHandler} from '../NullLoggerHandler.js';
import {Option} from '../Options.js';
import {WaveRecorder} from '../recorder/WaveRecorder.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as examples from 'retroload-examples';

// Disable log output for more readable test output
Logger.setHandler(new NullLoggerHandler());

test('Adapter manager returns options that have at least key, label and description set', () => {
  const options = AdapterManager.getAllOptions();
  expect(options.length).toBeGreaterThan(0);
  for (const o of options) {
    expect(o).toBeInstanceOf(Option);
    expect(typeof o.key).toBe('string');
    expect(typeof o.label).toBe('string');
    expect(typeof o.description).toBe('string');
    expect(typeof o.getCommanderFlagsString()).toBe('string');
  }
});

describe('Encoding pipeline', () => {
  it.each(examples.getExamples())(
      'returns correct hash for example %s',
      (example) => {
        const hash = encodeAndHash(example.getUrl().pathname, example.options);
        expect(hash).toBe(example.hash);
      },
  );
});

function encodeAndHash(file, options) {
  const recorder = new WaveRecorder();
  const data = fs.readFileSync(file);
  const arrayBuffer = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
  );
  if (!AdapterManager.encode(recorder, file, arrayBuffer, options)) {
    Logger.error('Unable to decode ' + file);
    return false;
  }

  return hash(recorder.getBuffer());
}

function hash(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}
