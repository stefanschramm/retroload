import {type BufferAccess} from './BufferAccess.js';

export function calculateChecksum8(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum = (sum + data.getUint8(i)) & 0xff;
  }

  return sum;
}

export function calculateChecksum16Le(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i += 2) {
    sum = (sum + data.getUint16Le(i)) & 0xffff;
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

/**
 * https://gist.github.com/chitchcock/5112270?permalink_comment_id=3834064#gistcomment-3834064
 *
 * Used by Amstrad CPC and IBM PC 5150.
 */
export function calculateCrc16Ccitt(ba: BufferAccess): number {
  const polynomial = 0x1021;
  let crc = 0xffff;
  for (let n = 0; n < ba.length(); n++) {
    const b = ba.getUint8(n);
    for (let i = 0; i < 8; i++) {
      const bit = (b >> (7 - i) & 1) === 1;
      const c15 = (crc >> 15 & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) {
        crc ^= polynomial;
      }
    }
  }

  crc &= 0xffff;

  return crc ^ 0xffff; // The negation is not part of the actual CRC16-CCITT code.
}

export function hex8(value: number): string {
  return `0x${value.toString(16).padStart(2, '0')}`;
}

export function hex16(value: number): string {
  return `0x${value.toString(16).padStart(4, '0')}`;
}
