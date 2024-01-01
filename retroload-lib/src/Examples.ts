import {type OptionValues} from './encoding/Options.js';

// Default option values are not automatically used when running outside CLI and have to be specified explicitly.

// Hashes are the md5sum of the WAV files generated using the specified options.

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
      '2023-12-10 (C64 C with BASICODE 3 Version D-1 MvD 1988; prg: d7c0990f12499ad2c3d31539e0366712, Basicode 3 Version D-1 (DE).d64: 962b708b1f6b5ac720c25e7848f4d796',
      '2023-12-10 (MSX Philips VG-8020 with BASICODE-3 (1987)(NOS)(NL).cas: 36018c4014149a46f600381fc4c4dadf',
    ],
  },
  // Atari 800 XL
  {
    dir: 'atari_bin',
    file: 'rl.cas',
    options: {},
    hash: '8d36a2a696c7e27807c4d1f058fdec34',
    instructions: 'START+POWERON\nPLAY\nANYKEY',
    tests: ['2023-01-19 OK (Atari 800 XL)'],
  },
  {
    dir: 'atari_generic',
    file: 'rl.atascii',
    options: {format: 'atarigeneric'},
    hash: '9f9c3073bd22e2fddde2e00128bb7f87',
    instructions: 'ENTER "C:"',
    tests: ['2023-01-20 OK (Atari 800 XL)'],
  },
  // C64, VIC-20
  {
    dir: 'c64',
    file: 'rl.bin',
    options: {format: 'c64generic', c64type: 'prg', load: '1100', shortpilot: true, name: 'RL'},
    hash: '311f888c7b54f91e891669a2b8143724',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.bin',
    options: {format: 'c64generic', c64type: 'prg', load: '1100', c64machine: 'vic20pal', name: 'RL', shortpilot: true},
    hash: '1da0116336d9e0b9da78e999e71db769',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-12-10 OK (VIC 20)'],
  },
  {
    dir: 'c64',
    file: 'rl.p00',
    options: {shortpilot: true},
    hash: '2528990f8be66728547e9093c950c7e7',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.p00',
    options: {shortpilot: true, c64machine: 'vic20pal'},
    hash: '22632a7e87fabad29b64a969bf55e85d',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-12-10 OK (VIC 20)'],
  },
  {
    dir: 'c64',
    file: 'rl.prg',
    options: {name: 'RL', shortpilot: true},
    hash: '311f888c7b54f91e891669a2b8143724',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.prg',
    options: {c64machine: 'vic20pal', shortpilot: true, name: 'RL'},
    hash: '1da0116336d9e0b9da78e999e71db769',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-12-10 OK (VIC 20)'],
  },
  {
    dir: 'c64',
    file: 'rl.t64',
    options: {},
    hash: '790dd09b31f37c94df4515ca341fa14d',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.t64',
    options: {shortpilot: true, c64machine: 'vic20pal'},
    hash: '1da0116336d9e0b9da78e999e71db769',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-12-10 OK (VIC 20)'],
  },
  {
    dir: 'c64',
    file: 'rl.tap',
    options: {},
    hash: '3cb06d683c7faa7964be578556cd5ee5',
    instructions: 'LOAD\n<space>\nSYS 4352',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  {
    dir: 'c64',
    file: 'rl.tap',
    options: {c64machine: 'vic20pal'},
    hash: 'ff0e04c9f8cccbd0034cbfb63cc074e7',
    instructions: 'LOAD\nSYS 4352',
    tests: ['2023-12-10 OK (VIC 20)'],
  },
  {
    dir: 'c64_data',
    file: 'rl.txt',
    options: {format: 'c64generic', c64type: 'data', name: 'RL', shortpilot: true},
    hash: 'fe571cb56a1d543088c9f3f9d36b47e4',
    instructions: '10 OPEN 1,1,0,"RL"\n20 INPUT#1,A$\n30 PRINT A$\nRUN',
    tests: ['2023-12-10 OK (C64 C)'],
  },
  // CPC 464
  {
    dir: 'cpc',
    file: 'rl.bin',
    options: {format: 'cpcgeneric', load: '2000', entry: '2000', name: 'RL'},
    hash: '2e567c9c44cd53585068bef5af5fa1ca',
    instructions: 'RUN ""',
    tests: ['2023-12-16 OK (CPC 464)'],
  },
  {
    dir: 'cpc',
    file: 'rl.cdt',
    options: {},
    hash: '433789b4e8e504999575848927d96b89',
    instructions: 'RUN ""',
    tests: ['2023-12-16 OK (CPC 464)'],
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
    options: {format: 'kcgeneric', name: 'RL', load: '0300', entry: '0300', firstblock: '0'},
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
    options: {name: 'RL', format: 'kcbasic', kcbasictype: 'ascii'},
    hash: 'a971316b56ffe172a931455ce641819c',
    instructions: 'BASIC\n<return>\nLOAD#1 "RL"',
    tests: ['2023-07-19 OK (KC 87)'],
  },
  // LC 80
  {
    dir: 'lc80_bin',
    file: 'rl.bin',
    options: {name: 'ffff', load: '2000', format: 'lc80generic'},
    hash: '6ec4e27820649e0708f095b6d05a0b19',
    instructions: '<LD>FFFF<EX>\n<RES><ADR>2000<EX>',
    tests: ['2023-12-15 OK (LC 80)'],
  },
  // MSX
  {
    dir: 'msx_ascii',
    file: 'rl.cas',
    options: {},
    hash: 'c2560f08b79e0b687010cf89a90880ff',
    instructions: 'run"cas:"',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_ascii',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: '346a57e55977db18c09775979c902eeb',
    instructions: 'run"cas:"',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_ascii',
    file: 'rl.txt',
    options: {format: 'msxgeneric', shortpilot: true, msxfast: true, name: 'RL', msxtype: 'ascii'},
    hash: '346a57e55977db18c09775979c902eeb',
    instructions: 'run"cas:"',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_basic',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: '8c041198ae397d0c1fb04a6676003ff9',
    instructions: 'cload\nrun',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_basic',
    file: 'rl.bas',
    options: {format: 'msxgeneric', shortpilot: true, msxfast: true, name: 'RL', msxtype: 'basic'},
    hash: '8c041198ae397d0c1fb04a6676003ff9',
    instructions: 'cload\nrun',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_binary',
    file: 'rl.cas',
    options: {shortpilot: true, msxfast: true},
    hash: 'abcc9aef0dbe1802df60c6bb05d2d09c',
    instructions: 'bload"cas:",r',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
  },
  {
    dir: 'msx_binary',
    file: 'rl.bin',
    options: {format: 'msxgeneric', shortpilot: true, msxfast: true, name: 'RL', load: '8000', entry: '8000', msxtype: 'binary'},
    hash: 'abcc9aef0dbe1802df60c6bb05d2d09c',
    instructions: 'bload"cas:",r',
    tests: ['2023-12-10 OK (Philips VG-8020)'],
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
    options: {format: 'mo5generic', name: 'RL      BAS'},
    hash: '7d95331ca42d2a8d3990ae2846bd8b7d',
    instructions: 'LOAD"",R',
    tests: ['2023-12-16 OK (Thomson MO5)'],
  },
  {
    dir: 'mo5_bas',
    file: 'rl.k7',
    options: {},
    hash: '7d95331ca42d2a8d3990ae2846bd8b7d',
    instructions: 'LOAD"",R',
    tests: ['2023-12-16 OK (Thomson MO5)'],
  },
  {
    dir: 'mo5_bin',
    file: 'rl.bin',
    options: {format: 'mo5generic', mo5type: '2', name: 'RL      BIN'},
    hash: '9e5b3220c936b54b757dbc481d5abaa9',
    instructions: 'LOADM"",,R',
    tests: ['2023-12-16 OK (Thomson MO5)'],
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
    hash: '7542dc62333365b44352986b3a278dbb',
    instructions: 'L 1000 108F\nJ 1000',
    tests: ['2023-12-15 OK (Z 1013)'],
  },
  {
    dir: 'z1013',
    file: 'rl.z80',
    options: {noheadersave: true},
    hash: '7542dc62333365b44352986b3a278dbb',
    instructions: 'L 1000 108F\nJ 1000',
    tests: ['2023-12-15 OK (Z 1013)'],
  },
  {
    dir: 'z1013',
    file: 'rl.z80',
    options: {},
    hash: 'd50460ece01ed53986eea86a9cc1e4e1',
    instructions: '@L',
    tests: ['2023-12-15 OK (Z 1013 using Headersave 5.95 loaded at 3C00-3FFF)'],
  },
  // ZX 81
  {
    dir: 'zx81_p',
    file: 'rl.p',
    options: {name: 'RL'},
    hash: '4d84757fcc4f8b7599d82420e9523fea',
    instructions: 'LOAD""\nRUN',
    tests: ['2023-12-15 OK (ZX 81)'],
  },
  // ZX Spectrum
  {
    dir: 'zxspectrum',
    file: 'rl.bas',
    options: {format: 'zxspectrumgeneric', name: 'RL', zxtype: '0'},
    hash: 'd4cb4e3c2bc9305fb1be75d1ffb9ab55',
    instructions: 'LOAD ""\nRUN',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'number_array.dat', // contains a 1-dimensional array with 4 elements: 23, 41, 13, 37
    options: {format: 'zxspectrumgeneric', name: 'RL', zxtype: '1'},
    hash: 'cf39cc76b5eafe9b92efe381d9b140e1',
    instructions: 'LOAD "" DATA a()',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin',
    options: {format: 'zxspectrumgeneric', name: 'RL', load: '8000', zxtype: '3'},
    hash: 'e530f613a3d4eaaddb228bad63303c92',
    instructions: 'LOAD ""CODE\nPRINT USR 32768',
    tests: ['2023-11-03 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bas.tap',
    options: {format: 'zxspectrumtap'},
    hash: '5774288880c565b74a81d2e9138d8fb8',
    instructions: 'LOAD ""\nRUN',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin.tap',
    options: {format: 'zxspectrumtap'},
    hash: 'e530f613a3d4eaaddb228bad63303c92',
    instructions: 'LOAD ""CODE\nPRINT USR 32768',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bas.tzx',
    options: {},
    hash: '5774288880c565b74a81d2e9138d8fb8',
    instructions: 'LOAD ""\nRUN',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
  },
  {
    dir: 'zxspectrum',
    file: 'rl.bin.tzx',
    options: {},
    hash: 'e530f613a3d4eaaddb228bad63303c92',
    instructions: 'LOAD "" CODE\nPRINT USR 32768',
    tests: ['2023-12-16 OK (ZX Spectrum+)'],
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
   * Hash (MD5) of the resulting WAVE file (44100 Hz, 8 Bit) that has successfully been loaded (retroload -l 0 -o /dev/stdout ... | md5sum).
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

export function getLocalPathByDirAndFile(dir: string, file: string): string {
  return `${__dirname}/../examples/formats/${dir}/${file}`;
}

export function getUrl(example: ExampleDefinition): string {
  return `https://github.com/stefanschramm/retroload/tree/main/retroload-lib/examples/formats/${example.dir}/${example.file}`;
}
