import {BufferAccess} from './BufferAccess.js';
import {calculateChecksum8} from './Utils.js';

test('calculateChecksum8', () => {
  const ba = BufferAccess.create(16);
  ba.writeAsciiString('EXAMPLE CONTENT');
  expect(calculateChecksum8(ba)).toBe(71);
});
