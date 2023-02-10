import {BufferAccess} from '../utils.js';

test('length', () => {
  const ba = BufferAccess.create(32);
  expect(ba.length()).toBe(32);
});

test('asHexDump', () => {
  const ba = BufferAccess.create(32);
  expect(ba.asHexDump()).toBe('00000000  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|\n00000010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  |................|');
});

test('setUint8', () => {
  const ba = BufferAccess.create(8);
  ba.setUint8(2, 0x41);
  expect(ba.asHexDump()).toBe('00000000  00 00 41 00 00 00 00 00                           |..A.....|');
});

test('setUint16LE', () => {
  const ba = BufferAccess.create(8);
  ba.setUint16LE(2, 0x4142);
  expect(ba.asHexDump()).toBe('00000000  00 00 42 41 00 00 00 00                           |..BA....|');
});

test('setUint16BE', () => {
  const ba = BufferAccess.create(8);
  ba.setUint16BE(2, 0x4142);
  expect(ba.asHexDump()).toBe('00000000  00 00 41 42 00 00 00 00                           |..AB....|');
});

test('setUint32LE', () => {
  const ba = BufferAccess.create(8);
  ba.setUint32LE(2, 0x41424344);
  expect(ba.asHexDump()).toBe('00000000  00 00 44 43 42 41 00 00                           |..DCBA..|');
});

test('setUint32BE', () => {
  const ba = BufferAccess.create(8);
  ba.setUint32BE(2, 0x41424344);
  expect(ba.asHexDump()).toBe('00000000  00 00 41 42 43 44 00 00                           |..ABCD..|');
});

test('setAsciiString', () => {
  const ba = BufferAccess.create(8);
  ba.setAsciiString(2, 'Hello');
  expect(ba.asHexDump()).toBe('00000000  00 00 48 65 6c 6c 6f 00                           |..Hello.|');
});

test('setAsciiString with padding', () => {
  const ba = BufferAccess.create(8);
  ba.setAsciiString(2, 'Hi', 4, 0x20);
  expect(ba.asHexDump()).toBe('00000000  00 00 48 69 20 20 00 00                           |..Hi  ..|');
});

test('slice', () => {
  const ba = BufferAccess.create(16);
  ba.setAsciiString(2, 'Hello World');
  const slice = ba.slice(8, 5);
  expect(slice.asHexDump()).toBe('00000000  57 6f 72 6c 64                                    |World|');
});

test('slice references original buffer', () => {
  const ba = BufferAccess.create(16);
  ba.setAsciiString(2, 'Hello World');
  const slice = ba.slice(8, 5);
  slice.setAsciiString(0, 'Halle');
  expect(ba.asHexDump()).toBe('00000000  00 00 48 65 6c 6c 6f 20  48 61 6c 6c 65 00 00 00  |..Hello Halle...|');
});

test('setBa', () => {
  const ba1 = BufferAccess.create(16);
  ba1.setAsciiString(0, 'Hello World');
  const ba2 = BufferAccess.create(5);
  ba2.setAsciiString(0, 'Halle');
  ba1.setBa(6, ba2);
  expect(ba1.asHexDump()).toBe('00000000  48 65 6c 6c 6f 20 48 61  6c 6c 65 00 00 00 00 00  |Hello Halle.....|');
});

test('copy creates a new buffer', () => {
  const ba1 = BufferAccess.create(16);
  ba1.setAsciiString(0, 'Hello World');
  const ba2 = ba1.copy(6, 5);
  expect(ba2.asHexDump()).toBe('00000000  57 6f 72 6c 64                                    |World|');
  ba2.setAsciiString(0, 'Halle');
  expect(ba1.asHexDump()).toBe('00000000  48 65 6c 6c 6f 20 57 6f  72 6c 64 00 00 00 00 00  |Hello World.....|');
});

test('copy works without arguments', () => {
  const ba1 = BufferAccess.create(16);
  ba1.setAsciiString(0, 'Hello World');
  const ba2 = ba1.copy();
  expect(ba2.asHexDump()).toBe('00000000  48 65 6c 6c 6f 20 57 6f  72 6c 64 00 00 00 00 00  |Hello World.....|');
});

test('write functions', () => {
  const ba = BufferAccess.create(32);

  const ba2 = BufferAccess.create(5);
  ba2.setAsciiString(0, 'Hello');

  ba.writeUInt8(0x01);
  ba.writeUInt16LE(0x0302);
  ba.writeUInt16BE(0x0405);
  ba.writeUInt32LE(0x09080706);
  ba.writeUInt32BE(0x0a0b0c0d);
  ba.writeAsciiString('AAA');
  ba.writeBa(ba2);

  expect(ba.asHexDump()).toBe('00000000  01 02 03 04 05 06 07 08  09 0a 0b 0c 0d 41 41 41  |.............AAA|\n00000010  48 65 6c 6c 6f 00 00 00  00 00 00 00 00 00 00 00  |Hello...........|');
});

test('get functions', () => {
  const ba = BufferAccess.create(32);
  ba.writeUInt8(0x01);
  ba.writeUInt16LE(0x0302);
  ba.writeUInt16BE(0x0405);
  ba.writeUInt32LE(0x09080706);

  expect(ba.getUint8(0)).toBe(0x01);
  expect(ba.getUint16LE(1)).toBe(0x0302);
  expect(ba.getUint16BE(3)).toBe(0x0405);
  expect(ba.getUint32LE(5)).toBe(0x09080706);
});

test('containsDataAt', () => {
  const ba1 = BufferAccess.create(16);
  ba1.setAsciiString(0, 'Hello World');
  expect(ba1.containsDataAt(6, 'World')).toBe(true);
  expect(ba1.containsDataAt(6, [0x57, 0x6f, 0x72, 0x6c, 0x64])).toBe(true);
  expect(ba1.containsDataAt(6, 'Halle')).toBe(false);
  expect(ba1.containsDataAt(6, [0x48, 0x61, 0x6c, 0x6c, 0x65])).toBe(false);
});

test('containsDataAt works with needle exceeding buffer length', () => {
  const ba1 = BufferAccess.create(16);
  ba1.setAsciiString(0, 'Hello World');
  expect(ba1.containsDataAt(6, 'World Example')).toBe(false);
});
