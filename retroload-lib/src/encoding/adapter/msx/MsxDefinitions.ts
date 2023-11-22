export enum MsxType {
  binary = 'binary',
  basic = 'basic',
  ascii = 'ascii',
}

export type MsxTypeStrings = keyof typeof MsxType;

export const msxTypeList = Object.keys(MsxType).join(', ');

export const typeHeaderMap: Record<MsxType, number> = {
  [MsxType.binary]: 0xd0,
  [MsxType.basic]: 0xd3,
  [MsxType.ascii]: 0xea,
};

export const typeHeaderLength = 10;

export const maxNameLength = 6;
