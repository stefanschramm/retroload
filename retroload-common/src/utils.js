/**
 * Checks whether dataView contains needle at specified offset
 *
 * @param {DataView} dataView
 * @param {number} offset
 * @param {string} needle
 *
 * @return {boolean}
 */
export function containsDataAt(dataView, offset, needle) {
  const isString = typeof needle === 'string';
  for (let i = 0; i < needle.length; i++) {
    if (offset + i > dataView.byteLength) {
      return false; // Needle longer than data to search in
    }
    if (dataView.getUint8(offset + i) !== (isString ? needle.charCodeAt(i) : needle[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Output hexdump of DataView to console
 *
 * @param {DataView} dataView
 */
export function dumpDv(dataView) {
  const printableCharsRegexp = /[^ -~]+$/g;
  const bytesPerRow = 16;
  const rows = Math.ceil(dataView.byteLength / bytesPerRow);
  for (let row = 0; row < rows; row++) {
    const remaining = (row === rows - 1 && dataView.byteLength % bytesPerRow !== 0) ? (dataView.byteLength % bytesPerRow) : 16;
    const offset = (row * bytesPerRow).toString(16).padStart(8, '0');
    let firstOctet = '';
    for (let i = 0; i < 8 && i < remaining; i++) {
      const byte = dataView.getUint8(row * bytesPerRow + i);
      firstOctet += byte.toString(16).padStart(2, '0') + ' ';
    }
    let secondOctet = '';
    for (let i = 8; i < 16 && i < remaining; i++) {
      const byte = dataView.getUint8(row * bytesPerRow + i);
      secondOctet += byte.toString(16).padStart(2, '0') + ' ';
    }
    let ascii = '';
    for (let i = 0; i < 16 && i < remaining; i++) {
      const byte = dataView.getUint8(row * bytesPerRow + i);
      ascii += String.fromCharCode(byte).replaceAll(printableCharsRegexp, '.');
    }
    const line = offset + '  ' + firstOctet.padEnd(24, ' ') + ' ' + secondOctet.padEnd(24, ' ') + ' |' + ascii + '|';
    console.log(line);
  };
}

/**
 * Extension of DataView supporting easy creation of referenced slices
 */
export class ExtDataView extends DataView {
  referencedSlice(offset, length) {
    if (offset >= this.byteLength) {
      throw new Error('Illegal offset.');
    }
    if (length !== undefined && offset + length > this.byteLength) {
      throw new Error('Illegal length.');
    }
    return new ExtDataView(
        this.buffer,
        this.byteOffset + offset,
        length !== undefined ? length : (this.byteLength - offset),
    );
  }

  // TODO: rename; won't actually copy it
  asUint8ArrayCopy() {
    return new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
  }

  asPaddedCopy(length) {
    if (this.byteLength > length || length === undefined) {
      throw new Error('Illegal length.');
    }
    const destination = new ExtDataView(new ArrayBuffer(length));
    for (let i = 0; i < this.byteLength; i++) {
      destination.setUint8(i, this.getUint8(i));
    }

    return destination;
  }

  asAsciiString() {
    return (new TextDecoder()).decode(this.asUint8ArrayCopy());
  }

  setString(offset, string, paddingLength = 0, paddingCharCode = 0) {
    for (let i = 0; i < string.length; i++) {
      this.setUint8(offset + i, string.charCodeAt(i));
    }
    for (let i = 0; i < paddingLength - string.length; i++) {
      this.setUint8(offset + string.length, paddingCharCode);
    }
  }

  setUint8Array(offset, source) {
    this.asUint8ArrayCopy().set(source, offset);
  }
}

/**
 * Helper for writing differently typed values into an ArrayBuffer
 *
 * @param {ArrayBuffer} buffer
 */
export class ArrayBufferWriter {
  constructor(buffer) {
    this.view = new DataView(buffer);
    this.offset = 0;
  }

  writeUInt8(i) {
    this.view.setInt8(this.offset, i);
    this.offset += 1;
  }

  writeUInt16LE(i) {
    this.view.setInt16(this.offset, i, true);
    this.offset += 2;
  }

  writeUInt32LE(i) {
    this.view.setInt32(this.offset, i, true);
    this.offset += 4;
  }

  write(str) {
    // TODO: check for only ASCII chars
    for (let i = 0; i < str.length; i += 1) {
      this.writeUInt8(str.charCodeAt(i));
    }
  }
}
