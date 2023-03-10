import {BufferAccess} from '../BufferAccess.js';

const baseTypes = [
  [
    // Number
    /^\d+/,
    'COPY',
  ],
  [
    // String
    /^"[^"]*"/,
    'COPY',
  ],
  [
    // Space
    /^ /,
    'COPY',
  ],
  [
    // Any character (catch-all) - TODO: is that OK?
    /./,
    'COPY',
  ],
];

/**
 * Tokenizer for pointer-based BASIC dialects
 *
 * Pointer-based BASIC dialects (KC, C64, TA, MSX) have a 16 bit little-endian pointer to the next line at the beginning of each line.
 * In contrast there also exist length-based dialects (Atari 800).
 */
export class PointerBasedSourceTokenizer {
  static tokenize(loadAddress, tokenMap, str) {
    const lines = str.trim().split('\n');
    const nonEmptyLines = lines.filter((l) => l.trim() !== '');
    // longest tokens first so that they will match first
    const sortedTokenMap = [...tokenMap].sort((a, b) => a[0].length > b[0].length ? -1 : 1);
    const tokenizedLines = nonEmptyLines.map((l) => (new LineTokenizer(sortedTokenMap, l)).tokenize());
    const compiledLines = [];
    let totalByteLength = 0;
    let nextLineAddress = loadAddress;
    for (const tl of tokenizedLines) {
      const lineNumber = tl[0].value; // TODO: check if number
      const tlTail = tl.slice(1);
      const lineByteLength = 2 + 2 + determineLineByteLength(tlTail) + 1; // 2 bytes pointer + 2 bytes line number + data + 1 end of line (zero)
      totalByteLength += lineByteLength;
      nextLineAddress += lineByteLength;
      const lineBa = BufferAccess.create(lineByteLength);
      lineBa.writeUInt16LE(nextLineAddress);
      lineBa.writeUInt16LE(lineNumber);
      for (const t of tlTail) {
        applyAction(t, lineBa);
      }
      lineBa.writeUInt8(0x00); // end of line
      compiledLines.push(lineBa);
    }
    const destinationBa = BufferAccess.create(totalByteLength + 2); // 0x00, 0x00 at the end
    for (const cl of compiledLines) {
      destinationBa.writeBa(cl);
    }

    return destinationBa;
  }
}

function escapeRegex(string) {
  // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

class LineTokenizer {
  constructor(sortedTokenMap, line) {
    this.l = line;
    this.pos = 0;
    this.tokens = [];
    this.types = [
      ...sortedTokenMap.map(function(t) {
        const keyword = t[0];
        const tokens = t.slice(1);
        return [
          new RegExp('^' + escapeRegex(keyword), 'i'), // case insensitive
          'MAP',
          tokens,
        ];
      }),
      ...baseTypes,
    ];
  }

  tokenize() {
    while (this.hasTokensLeft()) {
      this.tokens.push(this.getNextToken());
    }

    return this.tokens;
  }

  hasTokensLeft() {
    return this.pos < this.l.length;
  }

  getNextToken() {
    const s = this.l.slice(this.pos);
    for (const [regexp, action, ...mappedValue] of this.types) {
      const matched = regexp.exec(s);
      if (matched !== null) {
        this.pos += matched[0].length;
        return {
          action: action,
          value: matched[0],
          mappedValue: mappedValue,
        };
      }
    }

    throw new Error(`Unable to tokenize: "${s}"`);
  }
}

function determineLineByteLength(tokens) {
  return tokens.reduce((a, b) => a + determineTokenByteLength(b), 0);
}

function determineTokenByteLength(token) {
  switch (token.action) {
    case 'COPY':
      return token.value.length;
    case 'MAP':
      return token.mappedValue[0].length;
    default:
      throw new Error(`Unknown action: ${token.action}`);
  }
}

function applyAction(token, lineBa) {
  switch (token.action) {
    case 'COPY':
      lineBa.writeAsciiString(token.value);
      return;
    case 'MAP':
      for (const val of token.mappedValue[0]) {
        lineBa.writeUInt8(val);
      }
      return;
    default:
      throw new Error(`Unknown action: ${token.action}`);
  }
}
