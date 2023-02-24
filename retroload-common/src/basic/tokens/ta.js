/**
 * TA alphatronic PC BASIC tokens determined by loading and listing the loaded program.
 * (Microsoft ROM BASIC Ver 5.11B)
 *
 * TODO: Are there 2-byte tokens?
 *
 * 0x20 - 0x7E  ASCII with following exceptions:
 *
 * 0x40 @ -> §
 * 0x5B [ -> Ä
 * 0x5C \ -> Ö
 * 0x5D ] -> Ü
 * 0x7B { -> ä
 * 0x7C | -> ö
 * 0x7D } -> ü
 * 0x7E ~ -> ß
 *
 * Weirdo-tokens are commented-out
 */
export const TOKENS = [
  // ['7', 0xEC],
  // ['_', 0xFD],
  ['-', 0xF2],
  // [')', 0xE7],
  // [')', 0xEB],
  ['*', 0xF3],
  ['/', 0xF4],
  ['`', 0xE0],
  // ['`5*FT', 0xE9],
  ['^', 0xF5],
  // ['+', 0xD2],
  // ['+', 0xED],
  // ['+', 0xF1],
  ['<', 0xF0],
  ['=', 0xEF],
  ['>', 0xEE],
  // ['$', 0xFE],
  ['AND', 0xF6],
  ['ATTR$', 0xE3],
  ['AUTO', 0xAA],
  ['BEEP', 0xB4],
  ['CALL', 0xB3],
  ['CHAIN', 0xB9],
  ['CLEAR', 0x92],
  ['CLOAD', 0x9B],
  ['CLOSE', 0xC2],
  ['CLS', 0xD0],
  ['COLOR', 0xCE],
  ['COMMON', 0xB8],
  ['CONSOLE', 0xD1],
  ['CONT', 0x99],
  ['CSAVE', 0x9A],
  ['CSRLIN', 0xE2],
  // ['d', 0xEA],
  ['DATA', 0x84],
  ['DEF', 0x97],
  ['DEFDBL', 0xAF],
  ['DEFINT', 0xAD],
  ['DEFSNG', 0xAE],
  ['DEFSTR', 0xAC],
  ['DELETE', 0xA9],
  ['DIM', 0x86],
  ['DSKI$', 0xE4],
  ['DSKO$', 0xBC],
  ['EDIT', 0xA6],
  ['END', 0x81],
  ['EQV', 0xF9],
  ['ERASE', 0xA5],
  ['ERL', 0xDB],
  ['ERR', 0xDC],
  ['ERROR', 0xA7],
  ['FIELD', 0xBE],
  ['FILES', 0xC5],
  ['FN', 0xD8],
  ['FOR', 0x82],
  ['GET', 0xBF],
  ['GOSUB', 0x8D],
  ['GOTO', 0x89],
  ['HEX$', 0xFF, 0x9A], // TODO: are there other multi-byte tokens?
  ['IF', 0x8B],
  ['IMP', 0xFA],
  ['INKEY$', 0xE6],
  ['INPUT', 0x85],
  ['INSTR', 0xDF],
  ['KEY', 0x9F],
  ['KILL', 0xC7],
  ['LET', 0x88],
  ['LFILES', 0xCB],
  ['LINE', 0xB0],
  ['LIST', 0x93],
  ['LLIST', 0x9E],
  ['LOAD', 0xC3],
  ['LOCATE', 0xCF],
  ['LPRINT', 0x9D],
  ['LSE', 0xA1],
  ['LSET', 0xC8],
  ['MERGE', 0xC4],
  ['MOD', 0xFB],
  ['MON', 0xB5],
  ['NAME', 0xC6],
  ['NEW', 0x94],
  ['NEXT', 0x83],
  ['NOT', 0xDA],
  // ['ö', 0xE8],
  // ['Ö', 0xFC],
  ['ON', 0x95],
  ['OPEN', 0xBD],
  ['OPTION', 0xBA],
  ['OR', 0xF7],
  ['OUT', 0x9C],
  ['POINT', 0xE5],
  ['POKE', 0x98],
  ['PRESET', 0xCD],
  ['PRINT', 0x91],
  ['PSET', 0xCC],
  ['PUT', 0xC0],
  ['Q', 0xB6],
  ['RANDOMIZE', 0xBB],
  ['READ', 0x87],
  ['REM', 0x8F],
  ['RENUM', 0xAB],
  ['RESTORE', 0x8C],
  ['RESUME', 0xA8],
  ['RETURN', 0x8E],
  ['RSET', 0xC9],
  ['RUN', 0x8A],
  ['SAVE', 0xCA],
  ['SET', 0xC1],
  ['SPC(', 0xD9],
  ['STEP', 0xD6],
  ['STOP', 0x90],
  ['STRING$', 0xDD],
  ['SWAP', 0xA4],
  ['TAB(', 0xD5],
  ['THEN', 0xD4],
  ['TO', 0xD3],
  ['TROFF', 0xA3],
  ['TRON', 0xA2],
  ['USING', 0xDE],
  ['USR', 0xD7],
  ['VARPTR', 0xE1],
  ['WAIT', 0x96],
  ['WEND', 0xB2],
  ['WHILE', 0xB1],
  ['WIDTH', 0xA0],
  ['WRITE', 0xB7],
  ['XOR', 0xF8],
];
