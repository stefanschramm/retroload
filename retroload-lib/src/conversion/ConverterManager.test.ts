import {getLocalPathByDirAndFile} from '../Examples.js';
import {BufferAccess} from '../common/BufferAccess.js';
import {convert} from './ConverterManager.js';
import * as fs from 'fs';

test('Format kctap is converted correctly', () => {
  const data = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('kc851_tap', 'rl.com')));

  const result = convert(data, 'kctap', {});

  const expectedData = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('kc851_tap', 'rl.tap')));
  expect(result.asHexDump()).toBe(expectedData.asHexDump());
});

test('Format ataricas is converted correctly', () => {
  const data = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('atari_bin', 'rl.bin')));

  const result = convert(data, 'ataricas', {});

  const expectedData = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('atari_bin', 'rl.cas')));
  expect(result.asHexDump()).toBe(expectedData.asHexDump());
});
