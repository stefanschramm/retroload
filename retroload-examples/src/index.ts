// Default option values are not automatically used when running outside CLI and have to be specified explicitly.
// The hashes are md5sums of the resulting WAVE files (when running retroload cli with -o option).
export function getExamples() {
  return [
    // Acorn Electron
    new Example('electron_generic', 'rl.bas', {machine: 'electron', format: 'generic', name: 'RL', load: '0e00', entry: '801f', shortpilot: true}, 'e64e45d7c1f4d7fb2eaed067b05b5112', 'CHAIN ""'), // 2023-04-02 (Acorn Electron)
    new Example('electron_generic', 'rl.uef', {shortpilot: true}, 'e64e45d7c1f4d7fb2eaed067b05b5112', 'CHAIN ""'), // 2023-04-02 (Acorn Electron)
    // Atari 800 XL
    new Example('atari_cas', 'rl.cas', {}, '8d36a2a696c7e27807c4d1f058fdec34', 'START+POWERON\nPLAY\nANYKEY'), // 2023-01-19 OK (Atari 800 XL)
    new Example('atari_generic', 'rl.atascii', {machine: 'atari'}, '9f9c3073bd22e2fddde2e00128bb7f87', 'ENTER "C:"'), // 2023-01-20 OK (Atari 800 XL)
    // C64, VIC-20
    new Example('c64', 'rl.bin', {machine: 'c64', c64type: 'prg', load: '1100'}, '1233722ffe4f62310c6777aaf606b5c2', 'LOAD\n<space>\nSYS 4352'), // 2023-01-29 OK (C64 C)
    new Example('c64', 'rl.p00', {shortpilot: true}, '8f3bf1bfd24a2881680bb7f5f94d13c8', 'LOAD\n<space>\nSYS 4352'), // 2023-01-29 OK (C64 C)
    new Example('c64', 'rl.prg', {}, '1233722ffe4f62310c6777aaf606b5c2', 'LOAD\n<space>\nSYS 4352'), // 2022-11-16 OK (C64 C)
    new Example('c64', 'rl.t64', {shortpilot: false}, '9a59e4a22a9bc475cb0bb3eb405dd260', 'LOAD\n<space>\nSYS 4352'), // 2023-01-29 OK (C64 C)
    new Example('c64', 'rl.tap', {}, 'ecba52a4a6a2e894c3473590b77890dc', 'LOAD\n<space>\nSYS 4352'), // 2022-11-16 OK (C64 C)
    // CPC 464
    new Example('cpc', 'rl.bin', {machine: 'cpc', load: '2000', entry: '2000', name: 'RL'}, '30d06c882c900ffb970dc6154e5b4141', 'RUN ""'), // 2023-02-11 OK (CPC 464)
    new Example('cpc', 'rl.cdt', {}, 'd08d4975fef3fb4bb78bb93224ca7ea3', 'RUN ""'), // 2023-02-11 OK (CPC 464)
    // KC 85/1, KC 87, Z 9001
    new Example('kc851_tap', 'rl.tap', {}, '117e0758f5effea2aaff8a234797ea19', 'RL\n<return>'), // 2022-11-16 OK (KC 85/1)
    new Example('kc851_tap', 'rl.com', {machine: 'kc', format: 'generic', name: 'RL', load: '0300', entry: '0300', kcfirstblock: '0'}, '117e0758f5effea2aaff8a234797ea19', 'RL\n<return>'), // 2023-07-09 OK (KC 87)
    // KC 85/4
    new Example('kc_kcc', 'rl.kcc', {}, '7c81f6a04a7745a26afaff0e55c9b901', 'LOAD\nRL'), // 2022-11-16 OK (KC 85/4)
    new Example('kc_sss', 'rl.sss', {name: 'RL'}, '47de579a63d2e2c92bc0248a365a24b3', 'BASIC\n<return>\nCLOAD"RL"'), // 2023-06-16 OK (KC 85/4)
    // KC BASIC
    new Example('kc_basic_generic', 'rl.txt', {name: 'RL', machine: 'kc', format: 'kcbasic', kcbasictype: 'ascii'}, 'a971316b56ffe172a931455ce641819c', 'BASIC\n<return>\nLOAD#1 "RL"'), // 2023-07-19 OK (KC 87)
    // LC 80
    new Example('lc80_bin', 'rl.bin', {name: 'ffff', load: '2000', machine: 'lc80'}, '3a92341af5d83050caf3112cf053d8d3', '<LD>FFFF<EX>\n<RES><ADR>2000<EX>'), // 2022-11-30 OK (LC 80)
    // MSX
    new Example('msx_cas_ascii', 'rl.cas', {}, '5e974eb15ce8afd589e4dbfcdc3f27aa', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {msxfast: true}, 'd335600c14352b04bd2c062e71787b3c', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {shortpilot: true}, 'a3636befc559622203caadd1b8790bfb', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {shortpilot: true, msxfast: true}, 'b3f77adb22af24070301010796206ae2', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_basic', 'rl.cas', {shortpilot: true, msxfast: true}, 'dc4d7cbcc29679936312ae7eabc27624', 'cload\nrun'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_binary', 'rl.cas', {shortpilot: true, msxfast: true}, '1eaa89c87bad3f9a4a900a028db83c64', 'bload"cas:",r'), // 2022-11-29 OK (Philips VG-8020)
    // TA alphatronic PC
    new Example('ta_bas', 'rl.bas', {format: 'generic', machine: 'ta'}, '1d084c6b0dfa38930f26ad2cc3166dd0', 'cload\nrun'), // 2023-02-17 OK (TA alphatronic PC)
    // Thomson MO5
    new Example('mo5_bas', 'rl.bas', {machine: 'mo5', name: 'RL      BAS'}, '9bf6bd56b1ec9d85e7d6d72f7d87fece', 'LOAD"",R'), // 2023-04-16 OK (Thomson MO5)
    new Example('mo5_bas', 'rl.k7', {}, '9bf6bd56b1ec9d85e7d6d72f7d87fece', 'LOAD"",R'), // 2023-04-16 OK (Thomson MO5)
    new Example('mo5_bin', 'rl.bin', {machine: 'mo5', mo5type: '2', name: 'RL      BIN'}, '827ed65977d2264ea635a9d70a1e2a8c', 'LOADM"",,R'), // 2023-04-16 OK (Thomson MO5)
    // Z 1013
    new Example('z1013_z13', 'rl.z13', {}, '34083eb0e8ee6f631e92a412c8926f71', 'L 0100 018F\nJ 0100'),
    new Example('z1013_z80', 'rl.z80', {}, '779a051a0ed4769462d24aded68a94b3', 'L 0100 0200\nJ 0100'),
    // ZX 81
    new Example('zx81_p', 'rl.p', {name: 'TEST'}, '23457ea2403a1e38be2911868a5b8bf4', 'LOAD""\nRUN'), // TODO: use different example filename (RL) and test again on real hardware
    // ZX Spectrum
    new Example('zxspectrum', 'rl.bas.tap', {format: 'zxspectrumtap'}, '1a5cddb97fb7e433bc518fac58a5c8bc', 'LOAD ""\nRUN'), // 2022-12-04 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bin.tap', {format: 'zxspectrumtap'}, '84f3375e693b3c42bdfb0e46cbc656c0', 'LOAD "" CODE\nPRINT USR 32768'), // 2022-12-06 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bas.tzx', {}, '1a5cddb97fb7e433bc518fac58a5c8bc', 'LOAD ""\nRUN'), // 2022-12-06 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bin.tzx', {}, '84f3375e693b3c42bdfb0e46cbc656c0', 'LOAD "" CODE\nPRINT USR 32768'), // 2022-12-06 OK (ZX Spectrum+)
  ];
}

// Redeclared here to make it independent of retroload-encoders
type OptionValues = Record<string, string | boolean>;

class Example {
  path: string;
  file: string;
  options: any;
  hash: string;
  constructor(path: string, file: string, options: OptionValues, expectedHash: string, _loadInstructions: string) {
    this.path = path;
    this.file = file;
    this.options = options;
    this.hash = expectedHash;
  }

  getPath() {
    return `${__dirname}/../../formats/${this.path}/${this.file}`;
  }

  toString() {
    return `${this.path}/${this.file}, options: ${JSON.stringify(this.options)}`;
  }
}
