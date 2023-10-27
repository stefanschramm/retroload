export type EditorState = {
  viewOffset: number;
  viewWidth: number;
  editRange: [number, number];
  samples: number[];
  changes: Changes;
  selectionStart: SelectionStart;
};

export type Changes = Record<number, number>;

export enum SelectionStart {
  NONE = -1,
  LEFT = 0,
  RIGHT = 1,
}
