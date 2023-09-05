export type EditorState = {
  viewOffset: number;
  viewWidth: number;
  editRange: [number, number];
  samples: number[];
  changes: Changes;
};

export type Changes = Record<number, number>;
