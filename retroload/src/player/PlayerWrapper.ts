export type PlayerWrapper = {
  play(buffer: Uint8Array): Promise<unknown>;
};
