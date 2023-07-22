import {type BufferAccess} from 'retroload-common/dist/cjs/BufferAccess.js';

export function calculateChecksum8(data: BufferAccess) {
  let sum = 0;
  for (let i = 0; i < data.length(); i++) {
    sum = (sum + data.getUint8(i)) & 0xff;
  }

  return sum;
}
