/**
 * Provides functions for convenient reading and writing of ArrayBuffers
 *
 * The set*-functions write data at specified offsets while
 * the write* functions write data at the current cursor position
 * and increment it.
 */
export class BufferAccess {
  cursor: number;
  view: DataView;
  ui8a: Uint8Array;
  constructor(buffer, offset = 0, length = null) {
    this.cursor = 0;
    this.view = new DataView(buffer, offset, length === null ? buffer.byteLength : length);
    this.ui8a = new Uint8Array(buffer, offset, length === null ? buffer.byteLength : length);
  }

  /**
   * Create new buffer of length bytes and return an BufferAccess object referencing the new buffer.
   *
   * @param {int} length
   * @return {BufferAccess}
   */
  static create(length) {
    return new BufferAccess(new ArrayBuffer(length));
  }

  /**
   * Return BufferAccess referencing the buffer slice that is used by the passed Uint8Array
   *
   * @param {Uint8Array} uint8Array
   * @return {BufferAccess}
   */
  static createFromUint8Array(uint8Array) {
    return new BufferAccess(uint8Array.buffer, uint8Array.offset, uint8Array.byteLength);
  }

  length() {
    return this.view.byteLength;
  }

  rewind() {
    this.cursor = 0;
  }

  asUint8Array() {
    return this.ui8a;
  }

  /**
   * Return slice that references the same buffer
   *
   * @param {int} offset
   * @param {int} length
   * @return {BufferAccess}
   */
  slice(offset, length) {
    if (offset >= this.view.byteLength) {
      throw new Error('Illegal offset.');
    }
    if (length !== undefined && offset + length > this.view.byteLength) {
      throw new Error('Illegal length.');
    }
    return new BufferAccess(
        this.view.buffer,
        this.view.byteOffset + offset,
        length !== undefined ? length : (this.view.byteLength - offset),
    );
  }

  /**
   * Return copy that references a new buffer
   *
   * @param {int} offset
   * @param {int} length
   * @return {BufferAccess}
   */
  copy(offset = 0, length = this.view.byteLength) {
    if (offset >= this.view.byteLength) {
      throw new Error('Illegal offset.');
    }
    if (length !== undefined && offset + length > this.view.byteLength) {
      throw new Error('Illegal length.');
    }
    const buffer = new ArrayBuffer(length);
    const ba = new BufferAccess(buffer);
    ba.setBa(0, this.slice(offset, length));

    return ba;
  }

  /**
   * @return {string} Hex-dump
   */
  asHexDump() {
    const printableCharsRegexp = /[^ -~]+$/g;
    const bytesPerRow = 16;
    const rows = Math.ceil(this.view.byteLength / bytesPerRow);
    const lines: string[] = [];
    for (let row = 0; row < rows; row++) {
      const remaining = (row === rows - 1 && this.view.byteLength % bytesPerRow !== 0) ? (this.view.byteLength % bytesPerRow) : 16;
      const offset = (row * bytesPerRow).toString(16).padStart(8, '0');
      let firstOctet = '';
      for (let i = 0; i < 8 && i < remaining; i++) {
        const byte = this.view.getUint8(row * bytesPerRow + i);
        firstOctet += byte.toString(16).padStart(2, '0') + ' ';
      }
      let secondOctet = '';
      for (let i = 8; i < 16 && i < remaining; i++) {
        const byte = this.view.getUint8(row * bytesPerRow + i);
        secondOctet += byte.toString(16).padStart(2, '0') + ' ';
      }
      let ascii = '';
      for (let i = 0; i < 16 && i < remaining; i++) {
        const byte = this.view.getUint8(row * bytesPerRow + i);
        ascii += String.fromCharCode(byte).replace(printableCharsRegexp, '.');
      }
      lines.push(offset + '  ' + firstOctet.padEnd(24, ' ') + ' ' + secondOctet.padEnd(24, ' ') + ' |' + ascii + '|');
    };

    return lines.join('\n');
  }

  asAsciiString() {
    return (new TextDecoder()).decode(this.ui8a);
  }

  setUint8(offset, i) {
    this.view.setInt8(offset, i);
  }

  writeUInt8(i) {
    this.view.setInt8(this.cursor, i);
    this.cursor += 1;
  }

  getUint8(offset) {
    return this.view.getUint8(offset);
  }

  setUint16LE(offset, i) {
    this.view.setInt16(offset, i, true);
  }

  writeUInt16LE(i) {
    this.view.setInt16(this.cursor, i, true);
    this.cursor += 2;
  }

  getUint16LE(offset) {
    return this.view.getUint16(offset, true);
  }

  setUint16BE(offset, i) {
    this.view.setInt16(offset, i, false);
  }

  writeUInt16BE(i) {
    this.view.setInt16(this.cursor, i, false);
    this.cursor += 2;
  }

  getUint16BE(offset) {
    return this.view.getUint16(offset, false);
  }

  setUint32LE(offset, i) {
    this.view.setInt32(offset, i, true);
  }

  writeUInt32LE(i) {
    this.view.setInt32(this.cursor, i, true);
    this.cursor += 4;
  }

  getUint32LE(offset) {
    return this.view.getUint32(offset, true);
  }

  setUint32BE(offset, i) {
    this.view.setInt32(offset, i, false);
  }

  writeUInt32BE(i) {
    this.view.setInt32(this.cursor, i, false);
    this.cursor += 4;
  }

  setAsciiString(offset, string, paddingLength = 0, paddingCharCode = 0) {
    for (let i = 0; i < string.length; i++) {
      this.view.setUint8(offset + i, string.charCodeAt(i));
    }
    for (let i = 0; i < paddingLength - string.length; i++) {
      this.view.setUint8(offset + string.length + i, paddingCharCode);
    }
  }

  writeAsciiString(string, paddingLength = 0, paddingCharCode = 0) {
    this.setAsciiString(this.cursor, string, paddingLength, paddingCharCode);
    this.cursor += Math.max(string.length, paddingLength);
  }

  /**
   * Copy the content of the passed BufferAccess into offset
   *
   * @param {int} offset
   * @param {BufferAccess} sourceBa
   */
  setBa(offset, sourceBa) {
    this.ui8a.set(sourceBa.asUint8Array(), offset);
  }

  writeBa(sourceBa) {
    this.setBa(this.cursor, sourceBa);
    this.cursor += sourceBa.length();
  }

  containsDataAt(offset, needle) {
    const isString = typeof needle === 'string';
    for (let i = 0; i < needle.length; i++) {
      if (offset + i > this.view.byteLength) {
        return false; // Needle longer than data to search in
      }
      if (this.view.getUint8(offset + i) !== (isString ? needle.charCodeAt(i) : needle[i])) {
        return false;
      }
    }

    return true;
  }
}
