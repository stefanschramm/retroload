import {type BufferAccess} from './BufferAccess.js';

export function calculateChecksum8(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum = (sum + data.getUint8(i)) & 0xff;
  }

  return sum;
}

export function calculateChecksum8Xor(ba: BufferAccess, initial = 0x00) {
  let sum = initial;
  for (let i = 0; i < ba.length(); i++) {
    sum ^= ba.getUint8(i);
  }

  return sum;
}

export function hex8(value: number): string {
  return `0x${value.toString(16).padStart(2, '0')}`;
}

export function hex16(value: number): string {
  return `0x${value.toString(16).padStart(4, '0')}`;
}
