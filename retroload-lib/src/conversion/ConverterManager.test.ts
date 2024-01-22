import {getLocalPathByDirAndFile} from '../Examples.js';
import {BufferAccess} from '../common/BufferAccess.js';
import {type OptionValues} from '../encoding/Options.js';
import {convert, getConverters} from './ConverterManager.js';
import * as fs from 'fs';

type TestDefinition = {
  name: string;
  dir: string;
  input: string;
  expected: string;
  options: OptionValues;
};

const formatTests: TestDefinition[] = [
  {
    name: 'ataricas',
    dir: 'atari_bin',
    input: 'rl.bin',
    expected: 'rl.cas',
    options: {},
  },
  {
    name: 'kctap',
    dir: 'kc851_tap',
    input: 'rl.com',
    expected: 'rl.tap',
    options: {load: '0300', entry: '0300', name: 'RL', kctype: 'COM'},
  },
];

test('getConverters() returns non empty list', () => {
  expect(getConverters().length).toBeGreaterThan(0);
});

describe('Formats are converted correctly', () => {
  it.each(formatTests.map((t: TestDefinition) => ({label: getTestLabel(t), definition: t})))(
    '$label',
    (test) => {
      const data = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile(test.definition.dir, test.definition.input)));
      const result = convert(data, test.definition.name, test.definition.options);
      const expectedData = BufferAccess.createFromNodeBuffer(fs.readFileSync(getLocalPathByDirAndFile(test.definition.dir, test.definition.expected)));
      expect(result.asHexDump()).toBe(expectedData.asHexDump());
    },
  );
});

function getTestLabel(test: TestDefinition): string {
  return `${test.name}: ${test.dir}/${test.input} --> ${test.dir}/${test.expected}, options: ${JSON.stringify(test.options)}`;
}
