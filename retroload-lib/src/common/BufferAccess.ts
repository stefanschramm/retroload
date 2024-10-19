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
  public static create(length: number): BufferAccess {
    return new BufferAccess(new ArrayBuffer(length));
  }

  /**
   * Return BufferAccess referencing the buffer slice that is used by the passed Uint8Array
   */
  public static createFromUint8Array(uint8Array: Uint8Array): BufferAccess {
    return new BufferAccess(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
  }

  public static createFromNodeBuffer(buffer: Buffer): BufferAccess {
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );

    return new BufferAccess(arrayBuffer);
  }

  private cursor: number;
  private readonly view: DataView;
  private readonly ui8a: Uint8Array;

  private constructor(buffer: ArrayBufferLike, offset = 0, length: (number | undefined) = undefined) {
    this.cursor = 0;
    this.view = new DataView(buffer, offset, length ?? buffer.byteLength);
    this.ui8a = new Uint8Array(buffer, offset, length ?? buffer.byteLength);
  }

  public length(): number {
    return this.view.byteLength;
  }

  public rewind(): void {
    this.cursor = 0;
  }

  public asUint8Array(): Uint8Array {
    return this.ui8a;
  }

  public * bytes(): Generator<number> {
    for (let i = 0; i < this.length(); i++) {
      yield this.getUint8(i);
    }
  }

  /**
   * Return slice that references the same buffer
   */
  public slice(offset: number, length: number | undefined = undefined): BufferAccess {
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
  public chunks(chunkSize: number): BufferAccess[] {
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
  public chunksPadded(chunkSize: number, padding = 0x00): BufferAccess[] {
    const unpaddedChunks = this.chunks(chunkSize);
    if (unpaddedChunks.length === 0) {
      return unpaddedChunks;
    }
    if (unpaddedChunks[unpaddedChunks.length - 1].length() === chunkSize) {
      return unpaddedChunks; // no padding required
    }
    const lastChunk = BufferAccess.create(chunkSize);
    lastChunk.writeBa(unpaddedChunks[unpaddedChunks.length - 1]);
    if (padding !== 0x00) {
      const remainingBytes = chunkSize - unpaddedChunks[unpaddedChunks.length - 1].length();
      for (let i = 0; i < remainingBytes; i++) {
        lastChunk.writeUint8(padding);
      }
    }

    return [
      ...unpaddedChunks.slice(0, unpaddedChunks.length - 1),
      lastChunk,
    ];
  }

  /**
   * Return copy that references a new buffer
   */
  public copy(offset = 0, length = this.view.byteLength): BufferAccess {
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

  public asHexDump(): string {
    // eslint-disable-next-line require-unicode-regexp
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
        firstOctet += `${byte.toString(16).padStart(2, '0')  } `;
      }
      let secondOctet = '';
      for (let i = 8; i < 16 && i < remaining; i++) {
        const byte = this.view.getUint8(row * bytesPerRow + i);
        secondOctet += `${byte.toString(16).padStart(2, '0')  } `;
      }
      let ascii = '';
      for (let i = 0; i < 16 && i < remaining; i++) {
        const byte = this.view.getUint8(row * bytesPerRow + i);
        ascii += String.fromCharCode(byte).replace(printableCharsRegexp, '.');
      }
      lines.push(`${offset  }  ${  firstOctet.padEnd(24, ' ')  } ${  secondOctet.padEnd(24, ' ')  } |${  ascii  }|`);
    }

    return lines.join('\n');
  }

  public asAsciiString(): string {
    return (new TextDecoder()).decode(this.ui8a);
  }

  public setUint8(offset: number, i: number): void {
    this.view.setInt8(offset, i);
  }

  public writeUint8(i: number): void {
    this.view.setInt8(this.cursor, i);
    this.cursor += 1;
  }

  public getUint8(offset: number): number {
    return this.view.getUint8(offset);
  }

  public setUint16Le(offset: number, i: number): void {
    this.view.setInt16(offset, i, true);
  }

  public writeUint16Le(i: number): void {
    this.view.setInt16(this.cursor, i, true);
    this.cursor += 2;
  }

  public getUint16Le(offset: number): number {
    return this.view.getUint16(offset, true);
  }

  public setUint16Be(offset: number, i: number): void {
    this.view.setInt16(offset, i, false);
  }

  public writeUint16Be(i: number): void {
    this.view.setInt16(this.cursor, i, false);
    this.cursor += 2;
  }

  public getUint16Be(offset: number): number {
    return this.view.getUint16(offset, false);
  }

  public setUint32Le(offset: number, i: number): void {
    this.view.setInt32(offset, i, true);
  }

  public writeUint32Le(i: number): void {
    this.view.setInt32(this.cursor, i, true);
    this.cursor += 4;
  }

  public getUint32Le(offset: number): number {
    return this.view.getUint32(offset, true);
  }

  public setUint32Be(offset: number, i: number): void {
    this.view.setInt32(offset, i, false);
  }

  public writeUint32Be(i: number): void {
    this.view.setInt32(this.cursor, i, false);
    this.cursor += 4;
  }

  public getFloat32Le(offset: number): number {
    return this.view.getFloat32(offset, true);
  }

  public setFloat32Le(offset: number, f: number): void {
    this.view.setFloat32(offset, f, true);
  }

  public writeFloat32Le(f: number): void {
    this.view.setFloat32(this.cursor, f, true);
    this.cursor += 4;
  }

  public setAsciiString(offset: number, string: string, paddingLength = 0, paddingCharCode = 0): void {
    for (let i = 0; i < string.length; i++) {
      this.view.setUint8(offset + i, string.charCodeAt(i));
    }
    for (let i = 0; i < paddingLength - string.length; i++) {
      this.view.setUint8(offset + string.length + i, paddingCharCode);
    }
  }

  public writeAsciiString(string: string, paddingLength = 0, paddingCharCode = 0): void {
    this.setAsciiString(this.cursor, string, paddingLength, paddingCharCode);
    this.cursor += Math.max(string.length, paddingLength);
  }

  /**
   * Copy the content of the passed BufferAccess into offset
   */
  public setBa(offset: number, sourceBa: BufferAccess): void {
    this.ui8a.set(sourceBa.asUint8Array(), offset);
  }

  public writeBa(sourceBa: BufferAccess): void {
    this.setBa(this.cursor, sourceBa);
    this.cursor += sourceBa.length();
  }

  /**
   * If needle is an empty string, true will be returned
   */
  public containsDataAt(offset: number, needle: string | number[]): boolean {
    const isString = typeof needle === 'string';
    for (let i = 0; i < needle.length; i++) {
      if (offset + i >= this.view.byteLength) {
        return false; // Trying to read behind end of buffer
      }
      if (this.view.getUint8(offset + i) !== (isString ? needle.charCodeAt(i) : needle[i])) {
        return false;
      }
    }

    return true;
  }
}
