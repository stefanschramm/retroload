import {BufferAccess} from 'retroload-common';

const baseTypes: PatternDefinition[] = [
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
  static tokenize(loadAddress: number, tokenMap: RawTokenDefinition[], str: string) {
    const lines = str.trim().split('\n');
    const nonEmptyLines = lines.filter((l) => l.trim() !== '');
    // longest tokens first so that they will match first
    const sortedTokenMap = [...tokenMap].sort((a, b) => (a[0] as string).length > (b[0] as string).length ? -1 : 1);
    const tokenizedLines = nonEmptyLines.map((l) => (new LineTokenizer(sortedTokenMap, l)).tokenize());
    const compiledLines: BufferAccess[] = [];
    let totalByteLength = 0;
    let nextLineAddress = loadAddress;
    for (const tl of tokenizedLines) {
      const lineNumber = tl[0].value as number; // TODO: check if number
      const tlTail = tl.slice(1);
      const lineByteLength = 2 + 2 + determineLineByteLength(tlTail) + 1; // 2 bytes pointer + 2 bytes line number + data + 1 end of line (zero)
      totalByteLength += lineByteLength;
      nextLineAddress += lineByteLength;
      const lineBa = BufferAccess.create(lineByteLength);
      lineBa.writeUint16Le(nextLineAddress);
      lineBa.writeUint16Le(lineNumber);
      for (const t of tlTail) {
        applyAction(t, lineBa);
      }
      lineBa.writeUint8(0x00); // end of line
      compiledLines.push(lineBa);
    }
    const destinationBa = BufferAccess.create(totalByteLength + 2); // 0x00, 0x00 at the end
    for (const cl of compiledLines) {
      destinationBa.writeBa(cl);
    }

    return destinationBa;
  }
}

function escapeRegex(string: string) {
  // https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

class LineTokenizer {
  l: string;
  pos: number;
  tokens: Token[];
  types: PatternDefinition[];
  constructor(sortedTokenMap: RawTokenDefinition[], line: string) {
    this.l = line;
    this.pos = 0;
    this.tokens = [];
    this.types = [
      ...sortedTokenMap.map((t) => {
        const keyword = t[0] as string;
        const tokens = t.slice(1) as number[];
        const patternDefinition: PatternDefinition = [
          new RegExp('^' + escapeRegex(keyword), 'i'), // case insensitive
          'MAP',
          tokens,
        ];
        return patternDefinition;
      }),
      ...baseTypes,
    ];
  }

  tokenize(): Token[] {
    while (this.hasTokensLeft()) {
      this.tokens.push(this.getNextToken());
    }

    return this.tokens;
  }

  hasTokensLeft() {
    return this.pos < this.l.length;
  }

  getNextToken(): Token {
    const s = this.l.slice(this.pos);
    for (const [regexp, action, ...mappedValue] of this.types) {
      const matched = (regexp as RegExp).exec(s);
      if (matched !== null) {
        this.pos += matched[0].length;
        return {
          action: action as string,
          value: matched[0],
          mappedValue: mappedValue as number[],
        };
      }
    }

    throw new Error(`Unable to tokenize: "${s}"`);
  }
}

function determineLineByteLength(tokens: Token[]): number {
  return tokens.reduce((a, b) => a + determineTokenByteLength(b), 0);
}

function determineTokenByteLength(token: Token): number {
  switch (token.action) {
    case 'COPY':
      return (token.value as string).length;
    case 'MAP':
      return (token.mappedValue as number[][])[0].length;
    default:
      throw new Error(`Unknown action: ${token.action}`);
  }
}

function applyAction(token: Token, lineBa: BufferAccess) {
  switch (token.action) {
    case 'COPY':
      lineBa.writeAsciiString(token.value as string);
      return;
    case 'MAP':
      for (const val of token.mappedValue[0] as number[]) {
        lineBa.writeUint8(val);
      }
      return;
    default:
      throw new Error(`Unknown action: ${token.action}`);
  }
}

type Token = {
  action: string;
  value: any;
  mappedValue: number[] | number[][];
};

type PatternDefinition = Array<RegExp | string | number | number[]>;

type RawTokenDefinition = Array<string | number>;
