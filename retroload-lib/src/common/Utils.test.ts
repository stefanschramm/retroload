import {BufferAccess} from './BufferAccess.js';
import {calculateChecksum8, hex16, hex8} from './Utils.js';

describe('Utils', () => {
  test('calculateChecksum8', () => {
    const ba = BufferAccess.create(16);
    ba.writeAsciiString('EXAMPLE CONTENT');
    expect(calculateChecksum8(ba)).toBe(71);
  });

  test('hex8', () => {
    expect(hex8(255)).toBe('0xff');
  });

  test('hex16', () => {
    expect(hex16(4080)).toBe('0x0ff0');
  });
});
