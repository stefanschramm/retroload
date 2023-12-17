import {getLocalPathByDirAndFile} from '../Examples.js';
import {BufferAccess} from '../common/BufferAccess.js';
import {convert} from './ConverterManager.js';
import * as fs from 'fs';

test('ConverterManager calls convert function of ConverterDefinition', () => {
  const data = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('kc851_tap', 'rl.com')));

  const result = convert(data, 'kctap', {});

  const expectedData = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile('kc851_tap', 'rl.tap')));
  expect(result.asHexDump()).toBe(expectedData.asHexDump());
});
