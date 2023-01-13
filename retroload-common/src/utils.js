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

export function dumpDv(dataView) {
  const printableCharsRegexp = /[^ -~]+$/g;
  const bytesPerRow = 16;
  const rows = Math.ceil(dataView.byteLength / bytesPerRow);
  for (let row = 0; row < rows; row++) {
    const remaining = (row === rows - 1) ? (dataView.byteLength % bytesPerRow) : 16;
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

  asUint8ArrayCopy() {
    return new Uint8Array(this.buffer, this.byteOffset, this.byteLength);
  }

  setString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      this.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
