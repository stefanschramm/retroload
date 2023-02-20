// run:
// NODE_OPTIONS=--experimental-vm-modules npx jest

import {WaveRecorder} from '../recorder/wave.js';
import * as AdapterManager from '../adapter_manager.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as examples from 'retroload-examples';
import {Logger} from '../logger.js';

describe('Encoding Pipeline', () => {
  it.each(examples.getExamples())(
      'returns correct hash (%s)',
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
    return false();
  }

  return hash(recorder.getBuffer());
}

function hash(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}
