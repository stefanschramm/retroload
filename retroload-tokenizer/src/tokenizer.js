import {BufferAccess} from 'retroload-common';

const types = [
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
    /^PRINT/i,
    'MAP', 0x91,
  ],
];
// TODO: complete...

class LineTokenizer {
  constructor(types, line) {
    this.types = types;
    this.l = line;
    this.pos = 0;
    this.tokens = [];
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
    for (const [regexp, action, mappedValue] of this.types) {
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
      return 1;
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
      lineBa.writeUInt8(token.mappedValue);
      return;
    default:
      throw new Error(`Unknown action: ${token.action}`);
  }
}

export class SourceTokenizer {
  tokenize(str) {
    const lines = str.trim().split('\n');
    const nonEmptyLines = lines.filter((l) => l.trim() !== '');
    const tokenizedLines = nonEmptyLines.map((l) => (new LineTokenizer(types, l)).tokenize());
    const compiledLines = [];
    let totalByteLength = 0;
    let nextLineAddress = 0x6001; // offset for TA alphatronic PC
    for (const tl of tokenizedLines) {
      const lineNumber = tl[0].value;
      const tlTail = tl.slice(1);
      const lineByteLength = 2 + 2 + determineLineByteLength(tlTail) + 1;
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
    const destinationBa = BufferAccess.create(totalByteLength + 11); // 1 x 0x00 at the end
    for (const cl of compiledLines) {
      destinationBa.writeBa(cl);
    }

    return destinationBa;
  }
}
