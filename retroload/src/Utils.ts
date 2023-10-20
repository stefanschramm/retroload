import fs from 'fs';
import {BufferAccess} from 'retroload-lib';

export function readFile(path: string): BufferAccess {
  try {
    return BufferAccess.createFromNodeBuffer(fs.readFileSync(path));
  } catch {
    console.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

export function writeFile(path: string, data: BufferAccess): void {
  try {
    fs.writeFileSync(path, data.asUint8Array());
  } catch {
    console.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
}
