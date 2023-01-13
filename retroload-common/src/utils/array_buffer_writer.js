class ArrayBufferWriter {
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

export {
  ArrayBufferWriter,
};
