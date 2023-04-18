/**
 * Provides functions for convenient reading and writing of ArrayBuffers
 *
 * The set*-functions write data at specified offsets while
 * the write* functions write data at the current cursor position
 * and increment it.
 */
export class BufferAccess {
  /**
   * Create new buffer of length bytes and return an BufferAccess object referencing the new buffer.
   */
  static create(length: number): BufferAccess {
    return new BufferAccess(new ArrayBuffer(length));
  }

  /**
   * Return BufferAccess referencing the buffer slice that is used by the passed Uint8Array
   */
  static createFromUint8Array(uint8Array: Uint8Array): BufferAccess {
    return new BufferAccess(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
  }

  cursor: number;
  view: DataView;
  ui8a: Uint8Array;

  constructor(buffer: ArrayBufferLike, offset = 0, length: (number | undefined) = undefined) {
    this.cursor = 0;
    this.view = new DataView(buffer, offset, length ?? buffer.byteLength);
    this.ui8a = new Uint8Array(buffer, offset, length ?? buffer.byteLength);
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
   */
  slice(offset: number, length: number | undefined = undefined): BufferAccess {
    if (offset >= this.view.byteLength) {
      throw new Error('Illegal offset.');
    }
    if (length !== undefined && offset + length > this.view.byteLength) {
      throw new Error('Illegal length.');
    }
    return new BufferAccess(
      this.view.buffer,
      this.view.byteOffset + offset,
      length ?? this.view.byteLength - offset,
    );
  }

  /**
   * Return chunks of specified size that reference the same buffer
   *
   * There will be no padding for the last chunk.
   */
  chunks(chunkSize: number): BufferAccess[] {
    if (chunkSize === 0) {
      throw new Error('Illegal chunk size.');
    }
    const chunkCount = Math.ceil(this.length() / chunkSize);
    const chunks: BufferAccess[] = [];
    for (let i = 0; i < chunkCount; i++) {
      chunks.push(this.slice(i * chunkSize, Math.min(chunkSize, this.length() - i * chunkSize)));
    }
    return chunks;
  }

  /**
   * Return chunks of specified size and pad last chunk
   *
   * If the last chunk required padding, it will be a copy while the other chunks are always references.
   */
  chunksPadded(chunkSize: number, paddingByte: number): BufferAccess[] {
    const unpaddedChunks = this.chunks(chunkSize);
    if (unpaddedChunks.length === 0) {
      return unpaddedChunks;
    }
    if (unpaddedChunks[unpaddedChunks.length - 1].length() === chunkSize) {
      return unpaddedChunks; // no padding required
    }
    const lastChunk = BufferAccess.create(chunkSize);
    lastChunk.writeBa(unpaddedChunks[unpaddedChunks.length - 1]);

    return [
      ...unpaddedChunks.slice(0, unpaddedChunks.length - 1),
      lastChunk,
    ];
  }

  /**
   * Return copy that references a new buffer
   */
  copy(offset = 0, length = this.view.byteLength): BufferAccess {
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

  asHexDump(): string {
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
    }

    return lines.join('\n');
  }

  asAsciiString() {
    return (new TextDecoder()).decode(this.ui8a);
  }

  setUint8(offset: number, i: number) {
    this.view.setInt8(offset, i);
  }

  writeUint8(i: number) {
    this.view.setInt8(this.cursor, i);
    this.cursor += 1;
  }

  getUint8(offset: number) {
    return this.view.getUint8(offset);
  }

  setUint16Le(offset: number, i: number) {
    this.view.setInt16(offset, i, true);
  }

  writeUint16Le(i: number) {
    this.view.setInt16(this.cursor, i, true);
    this.cursor += 2;
  }

  getUint16Le(offset: number) {
    return this.view.getUint16(offset, true);
  }

  setUint16Be(offset: number, i: number) {
    this.view.setInt16(offset, i, false);
  }

  writeUint16Be(i: number) {
    this.view.setInt16(this.cursor, i, false);
    this.cursor += 2;
  }

  getUint16Be(offset: number) {
    return this.view.getUint16(offset, false);
  }

  setUint32Le(offset: number, i: number) {
    this.view.setInt32(offset, i, true);
  }

  writeUint32Le(i: number) {
    this.view.setInt32(this.cursor, i, true);
    this.cursor += 4;
  }

  getUint32Le(offset: number) {
    return this.view.getUint32(offset, true);
  }

  setUint32Be(offset: number, i: number) {
    this.view.setInt32(offset, i, false);
  }

  writeUint32Be(i: number) {
    this.view.setInt32(this.cursor, i, false);
    this.cursor += 4;
  }

  setAsciiString(offset: number, string: string, paddingLength = 0, paddingCharCode = 0) {
    for (let i = 0; i < string.length; i++) {
      this.view.setUint8(offset + i, string.charCodeAt(i));
    }
    for (let i = 0; i < paddingLength - string.length; i++) {
      this.view.setUint8(offset + string.length + i, paddingCharCode);
    }
  }

  writeAsciiString(string: string, paddingLength = 0, paddingCharCode = 0) {
    this.setAsciiString(this.cursor, string, paddingLength, paddingCharCode);
    this.cursor += Math.max(string.length, paddingLength);
  }

  /**
   * Copy the content of the passed BufferAccess into offset
   */
  setBa(offset: number, sourceBa: BufferAccess) {
    this.ui8a.set(sourceBa.asUint8Array(), offset);
  }

  writeBa(sourceBa: BufferAccess) {
    this.setBa(this.cursor, sourceBa);
    this.cursor += sourceBa.length();
  }

  containsDataAt(offset: number, needle: string | number[]) {
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
