import fs from 'fs';

export function readFile(path: string): Uint8Array {
  try {
    const buffer = fs.readFileSync(path);
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );

    return new Uint8Array(arrayBuffer, 0, buffer.byteLength);
  } catch {
    console.error(`Error: Unable to read ${path}.`);
    process.exit(1);
  }
}

export function writeFile(path: string, data: Uint8Array): void {
  try {
    fs.writeFileSync(path, data);
  } catch {
    console.error(`Error: Unable to write output file ${path}`);
    process.exit(1);
  }
}
