// run:
// NODE_OPTIONS=--experimental-vm-modules npx jest

import {WaveRecorder} from '../recorder/wave.js';
import * as AdapterManager from '../adapter_manager.js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as examples from 'retroload-examples';

// Old examples
// ['testdata/cpc_cdt/RSX Clock (E).cdt', '5aca30f3daf0408f19c41b65acdb5be9'], // tested on CPC 464 on 2022-04-24
// ['testdata/kc_sss/BERGWERK.SSS', 'dfb1c97cb970791615165b33440afb3c'], // filename "TEST"; tested on KC 85/3 on 2022-03-15
// ['testdata/lc80_tap/example.tap', '6d852e81b3c8760f454d78ee8609306b'],
// ['testdata/zx81_p/chessqueen.p', 'ae7289b8ecf596b369af226cc09227e0'], // filename "TEST"

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
    console.error('Unable to decode ' + file);
    return false();
  }

  return hash(recorder.getBuffer());
}

function hash(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}
