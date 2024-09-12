import {type BufferAccess} from '../../common/BufferAccess.js';

export type ByteRecorder = {
  recordByte(byte: number): void;
  recordBit(value: number): void;
};

export function recordBytes(byteRecorder: ByteRecorder, dataBa: BufferAccess): void {
  for (const byte of dataBa.bytes()) {
    byteRecorder.recordByte(byte);
  }
}

export function recordByteLsbFirst(byteRecorder: ByteRecorder, byte: number): void {
  for (let i = 0; i < 8; i += 1) {
    byteRecorder.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
  }
}

export function recordByteMsbFirst(byteRecorder: ByteRecorder, byte: number): void {
  for (let i = 7; i >= 0; i -= 1) {
    byteRecorder.recordBit(((byte & (1 << i)) === 0) ? 0 : 1);
  }
}
