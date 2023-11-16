import {type OptionValues} from './encoding/Options.js';

// Default option values are not automatically used when running outside CLI and have to be specified explicitly.

const examples: ExampleDefinition[] = [
  // Acorn Electron
  {
    dir: 'electron_generic',
    file: 'rl.bas',
    options: {format: 'electrongeneric', name: 'RL', load: '0e00', entry: '801f', shortpilot: true},
    hash: 'e64e45d7c1f4d7fb2eaed067b05b5112',
    instructions: 'CHAIN ""',
    tests: ['2023-04-02 (Acorn Electron)'],
  },
  {
    dir: 'electron_generic',
    file: 'rl.bin',
    options: {format: 'electrongeneric', name: 'RL', load: '1000', entry: '1000', shortpilot: true},
    hash: '9e22655910cec0ac1ae64066a13e913d',
    instructions: '*RUN',
    tests: ['2023-10-28 (Acorn Electron)'],
  },
  {
    dir: 'electron_generic',
    file: 'rl.uef',
    options: {shortpilot: true},
    hash: 'e64e45d7c1f4d7fb2eaed067b05b5112',
    instructions: 'CHAIN ""',
    tests: ['2023-04-02 (Acorn Electron)'],
  },
  // BASICODE
  {
    dir: 'basicode',
    file: 'rl.txt',
    options: {format: 'basicode'},
    hash: '6adbadf4894d2ebb11636308671b64ad',
    instructions: '',
    tests: [
      '2023-10-31 (KC 87 with BASICODE-3 Andreas and Uwe Zierott 1.4; bac87_sss.tap: 266bc6b3753b75230d89f046297e0f4d)',
      '2023-10-31 (KC 85/4 with BASICODE-3C Andreas and Uwe Zierott, R. Wenzel 1.5; BAC854C.SSS: d48116eaeab75f01b31ba3515fd45615)',
    ],
  },
  // Atari 800 XL
  {
    dir: 'atari_cas',
    file: 'rl.cas',
    options: {},
    hash: '8d36a2a696c7e27807c4d1f058fdec34',
    instructions: 'START+POWERON\nPLAY\nANYKEY',
    tests: ['2023-01-19 OK (Atari 800 XL)'],
  },
  {
    dir: 'atari_generic',
    file: 'rl.atascii',
    options: {machine: 'atari'},
    hash: '9f9c3073bd22e2fddde2e00128bb7f87',
    instructions: 'ENTER "C:"',
    tests: ['2023-01-20 OK (Atari 800 XL)'],
  },
  // C64, VIC-20
  {
    dir: 'c64',
    file: 'rl.bin',
    options: {machine: 'c64', c64type: 'prg', load: '1100'},
    hash: '1233722ffe4f62310c6777aaf606b5c2',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-01-29 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.p00',
    options: {shortpilot: true},
    hash: '8f3bf1bfd24a2881680bb7f5f94d13c8',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-01-29 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.prg',
    options: {},
    hash: '1233722ffe4f62310c6777aaf606b5c2',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2022-11-16 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.t64',
    options: {shortpilot: false},
    hash: '9a59e4a22a9bc475cb0bb3eb405dd260',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-01-29 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.tap',
    options: {},
    hash: 'ecba52a4a6a2e894c3473590b77890dc',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2022-11-16 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.tap',
    options: {c64machine: 'vic20pal'},
    hash: 'cbea8b44c914cf6e7c7ea802cd3892f4',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-11-16 OK (VIC 20)'],
  },
  // CPC 464
  {
    dir: 'cpc',
    file: 'rl.bin',
    options: {machine: 'cpc', load: '2000', entry: '2000', name: 'RL'},
    hash: '30d06c882c900ffb970dc6154e5b4141',
    instructions: 'RUN ""',
    tests: ['2023-02-11 OK (CPC 464)'],
  },
  {
    dir: 'cpc',
    file: 'rl.cdt',
    options: {},
    hash: 'd08d4975fef3fb4bb78bb93224ca7ea3',
    instructions: 'RUN ""',
    tests: ['2023-02-11 OK (CPC 464)'],
  },
  // KC 85/1, KC 87, Z 9001
  {
    dir: 'kc851_tap',
    file: 'rl.tap',
    options: {},
    hash: '117e0758f5effea2aaff8a234797ea19',
    instructions: 'RL\n<return>',
    tests: ['2022-11-16 OK (KC 85/1)'],
  },
  {
    dir: 'kc851_tap',
    file: 'rl.com',
    options: {format: 'kcgeneric', name: 'RL', load: '0300', entry: '0300', kcfirstblock: '0'},
    hash: '117e0758f5effea2aaff8a234797ea19',
    instructions: 'RL\n<return>',
    tests: ['2023-07-09 OK (KC 87)'],
  },
  // KC 85/4
  {
    dir: 'kc_kcc',
    file: 'rl.kcc',
    options: {},
    hash: '7c81f6a04a7745a26afaff0e55c9b901',
    instructions: 'LOAD\nRL',
    tests: ['2022-11-16 OK (KC 85/4)'],
  },
  {
    dir: 'kc_sss',
    file: 'rl.sss',
    options: {name: 'RL'},
    hash: '47de579a63d2e2c92bc0248a365a24b3',
    instructions: 'BASIC\n<return>\nCLOAD"RL"',
    tests: ['2023-06-16 OK (KC 85/4)'],
  },
  // KC BASIC
  {
    dir: 'kc_basic_generic',
    file: 'rl.txt',
    options: {name: 'RL', machine: 'kc', format: 'kcbasic', kcbasictype: 'ascii'},
    hash: 'a971316b56ffe172a931455ce641819c',
    instructions: 'BASIC\n<return>\nLOAD#1 "RL"',
    tests: ['2023-07-19 OK (KC 87)'],
  },
  // LC 80
  {
    dir: 'lc80_bin',
    file: 'rl.bin',
    options: {name: 'ffff', load: '2000', machine: 'lc80'},
    hash: '3a92341af5d83050caf3112cf053d8d3',
    instructions: '<LD>FFFF<EX>\n<RES><ADR>2000<EX>',
    tests: ['2022-11-30 OK (LC 80)'],
  },
  // MSX
  {
    dir: 'msx_cas_ascii',
    file: 'rl.cas',
    options: {},
    hash: '5e974eb15ce8afd589e4dbfcdc3f27aa',
    instructions: 'run"cas:"',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_cas_ascii',
    file: 'rl.cas',
    options: {msxfast: true},
    hash: 'd335600c14352b04bd2c062e71787b3c',
    instructions: 'run"cas:"',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_cas_ascii',
    file: 'rl.cas',
    options: {shortpilot: true},
    hash: 'a3636befc559622203caadd1b8790bfb',
    instructions: 'run"cas:"',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_cas_ascii',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: 'b3f77adb22af24070301010796206ae2',
    instructions: 'run"cas:"',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_cas_basic',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: 'dc4d7cbcc29679936312ae7eabc27624',
    instructions: 'cload\nrun',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_cas_binary',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: '1eaa89c87bad3f9a4a900a028db83c64',
    instructions: 'bload"cas:",r',
    tests: ['2022-11-29 OK (Philips VG-8020)'],
  },
  // TA alphatronic PC
  {
    dir: 'ta_bas',
    file: 'rl.bas',
    options: {format: 'tageneric'},
    hash: '1d084c6b0dfa38930f26ad2cc3166dd0',
    instructions: 'cload\nrun',
    tests: ['2023-02-17 OK (TA alphatronic PC)'],
  },
  // Thomson MO5
  {
    dir: 'mo5_bas',
    file: 'rl.bas',
    options: {machine: 'mo5', name: 'RL      BAS'},
    hash: '9bf6bd56b1ec9d85e7d6d72f7d87fece',
    instructions: 'LOAD"",R',
    tests: ['2023-04-16 OK (Thomson MO5)'],
  },
  {
    dir: 'mo5_bas',
    file: 'rl.k7',
    options: {},
    hash: '9bf6bd56b1ec9d85e7d6d72f7d87fece',
    instructions: 'LOAD"",R',
    tests: ['2023-04-16 OK (Thomson MO5)'],
  },
  {
    dir: 'mo5_bin',
    file: 'rl.bin',
    options: {machine: 'mo5', mo5type: '2', name: 'RL      BIN'},
    hash: '827ed65977d2264ea635a9d70a1e2a8c',
    instructions: 'LOADM"",,R',
    tests: ['2023-04-16 OK (Thomson MO5)'],
  },
  // TI-99/4A
  {
    dir: 'ti_basic',
    file: 'rl.bin',
    options: {format: 'tigeneric'},
    hash: 'ed3e9e3e373d69e12197c389bc35627f',
    instructions: 'OLD CS1',
    tests: ['2023-07-21 OK (TI-99/4A)'],
  },
  {
    dir: 'ti_basic',
    file: 'rl.fiad',
    options: {format: 'fiad'},
    hash: 'fd7679575b06927b04bf946d1249f8c5',
    instructions: 'OLD CS1',
    tests: ['2023-07-22 OK (TI-99/4A)'],
  },
  {
    dir: 'ti_basic',
    file: 'rl.tifile',
    options: {},
    hash: 'ed3e9e3e373d69e12197c389bc35627f',
    instructions: 'OLD CS1',
    tests: ['2023-07-22 OK (TI-99/4A)'],
  },
  // Z 1013
  {
    dir: 'z1013',
    file: 'rl.z13',
    options: {},
    hash: 'c218c1653624c4be23e93623217ea561',
    instructions: 'L 1000 108F\nJ 1000',
    tests: ['2023-11-10 OK (Z 1013)'],
  },
  {
    dir: 'z1013',
    file: 'rl.z80',
    options: {z80noheadersave: true},
    hash: 'c218c1653624c4be23e93623217ea561',
    instructions: 'L 1000 108F\nJ 1000',
    tests: ['2023-11-10 OK (Z 1013)'],
  },
  {
    dir: 'z1013',
    file: 'rl.z80',
    options: {},
    hash: '36cf8a21270ff68ef9fd54f36a33989f',
    instructions: 'L 1000 108F\nJ 1000',
    tests: ['2023-11-12 OK (Z 1013 using Headersave 5.95)'],
  },
  // ZX 81
  {
    dir: 'zx81_p',
    file: 'rl.p',
    options: {name: 'RL'},
    hash: 'c69b949596cc6a158a229a4e3d6fb73a',
    instructions: 'LOAD""\nRUN',
    tests: ['2023-11-03 OK (ZX 81)'],
  },
  // ZX Spectrum
  {
    dir: 'zxspectrum',
    file: 'rl.bas',
    options: {format: 'zxspectrumgeneric', name: 'RL', zxtype: '0'},
    hash: '1284a33c7f22528d35f0472bc20aee75',
    instructions: 'LOAD ""\nRUN',
    tests: ['2023-11-03 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'number_array.dat', // contains a 1-dimensional array with 4 elements: 23, 41, 13, 37
    options: {format: 'zxspectrumgeneric', name: 'RL', zxtype: '1'},
    hash: '4b14148581938c3d8507e20786efa443',
    instructions: 'LOAD "" DATA a()',
    tests: ['2023-11-03 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin',
    options: {format: 'zxspectrumgeneric', name: 'RL', load: '8000', zxtype: '3'},
    hash: '84f3375e693b3c42bdfb0e46cbc656c0',
    instructions: 'LOAD ""CODE\nPRINT USR 32768',
    tests: ['2023-11-03 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bas.tap',
    options: {format: 'zxspectrumtap'},
    hash: '1a5cddb97fb7e433bc518fac58a5c8bc',
    instructions: 'LOAD ""\nRUN',
    tests: ['2022-12-04 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin.tap',
    options: {format: 'zxspectrumtap'},
    hash: '84f3375e693b3c42bdfb0e46cbc656c0',
    instructions: 'LOAD "" CODE\nPRINT USR 32768',
    tests: ['2022-12-06 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bas.tzx',
    options: {},
    hash: '1a5cddb97fb7e433bc518fac58a5c8bc',
    instructions: 'LOAD ""\nRUN',
    tests: ['2022-12-06 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin.tzx',
    options: {},
    hash: '84f3375e693b3c42bdfb0e46cbc656c0',
    instructions: 'LOAD "" CODE\nPRINT USR 32768',
    tests: ['2022-12-06 OK (ZX Spectrum+)'],
  },
];
export default examples;

export type ExampleDefinition = {
  /**
   * Subdirectory in formats directory.
   */
  dir: string;
  /**
   * File name
   */
  file: string;
  options: OptionValues;
  /**
   * Hash (MD5) of the resulting WAVE file (44100 Hz, 8 Bit) that has successfully been loaded (retroload -v 0 -o /dev/stdout ... | md5sum).
   */
  hash: string;
  /**
   * Instructions how to load the example.
   */
  instructions: string;
  /**
   * When and on which device the example has successfully been tested.
   */
  tests: string[];
};

export function getLocalPath(example: ExampleDefinition): string {
  return `${__dirname}/../examples/formats/${example.dir}/${example.file}`;
}

export function getUrl(example: ExampleDefinition): string {
  return `https://github.com/stefanschramm/retroload/tree/main/retroload-lib/examples/formats/${example.dir}/${example.file}`;
}
