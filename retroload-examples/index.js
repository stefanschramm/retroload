// Default option values are not automatically used when running outside CLI and have to be specified explicitly.
export function getExamples() {
  return [
    // Atari 800 XL
    new Example('atari_cas', 'rl.cas', {}, '8d36a2a696c7e27807c4d1f058fdec34', 'START+POWERON\nPLAY\nANYKEY'), // 2023-01-19 OK (Atari 800 XL)
    // C64, VIC-20
    new Example('c64', 'rl.tap', {}, 'ecba52a4a6a2e894c3473590b77890dc', 'LOAD\n<space>\nSYS 4352'), // 2022-11-16 OK (C64 C)
    new Example('c64', 'rl.prg', {}, '1233722ffe4f62310c6777aaf606b5c2', 'LOAD\n<space>\nSYS 4352'), // 2022-11-16 OK (C64 C)
    // KC 85/1
    new Example('kc851_tap', 'rl.tap', {}, '117e0758f5effea2aaff8a234797ea19', 'RL\n<return>'), // 2022-11-16 OK (KC 85/1)
    // KC 85/4
    new Example('kc_kcc', 'rl.kcc', {}, '7c81f6a04a7745a26afaff0e55c9b901', 'LOAD\nRL'), // 2022-11-16 OK (KC 85/4)
    // LC 80
    new Example('lc80_bin', 'rl.bin', {lc80name: 'ffff', lc80start: '2000'}, '3a92341af5d83050caf3112cf053d8d3', '<LD>FFFF<EX>\n<RES><ADR>2000<EX>'), // 2022-11-30 OK (LC 80)
    // MSX
    new Example('msx_cas_ascii', 'rl.cas', {}, '5e974eb15ce8afd589e4dbfcdc3f27aa', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {msxfast: true}, 'd335600c14352b04bd2c062e71787b3c', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {shortpilot: true}, 'a3636befc559622203caadd1b8790bfb', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_ascii', 'rl.cas', {shortpilot: true, msxfast: true}, 'b3f77adb22af24070301010796206ae2', 'run"cas:"'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_basic', 'rl.cas', {shortpilot: true, msxfast: true}, 'dc4d7cbcc29679936312ae7eabc27624', 'cload\nrun'), // 2022-11-29 OK (Philips VG-8020)
    new Example('msx_cas_binary', 'rl.cas', {shortpilot: true, msxfast: true}, '1eaa89c87bad3f9a4a900a028db83c64', 'bload"cas:",r'), // 2022-11-29 OK (Philips VG-8020)
    // Z 1013
    new Example('z1013_z13', 'rl.z13', {}, '34083eb0e8ee6f631e92a412c8926f71', 'L 0100 018F\nJ 0100'),
    new Example('z1013_z80', 'rl.z80', {}, '779a051a0ed4769462d24aded68a94b3', 'L 0100 0200\nJ 0100'),
    // ZX Spectrum
    new Example('zxspectrum', 'rl.bas.tap', {format: 'zxspectrumtap'}, '1a5cddb97fb7e433bc518fac58a5c8bc', 'LOAD ""\nRUN'), // 2022-12-04 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bin.tap', {format: 'zxspectrumtap'}, '84f3375e693b3c42bdfb0e46cbc656c0', 'LOAD "" CODE\nPRINT USR 32768'), // 2022-12-06 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bas.tzx', {}, '1a5cddb97fb7e433bc518fac58a5c8bc', 'LOAD ""\nRUN'), // 2022-12-06 OK (ZX Spectrum+)
    new Example('zxspectrum', 'rl.bin.tzx', {}, '84f3375e693b3c42bdfb0e46cbc656c0', 'LOAD "" CODE\nPRINT USR 32768'), // 2022-12-06 OK (ZX Spectrum+)
  ];
};

class Example {
  constructor(path, file, options, expectedHash, _loadInstructions) {
    this.path = path;
    this.file = file;
    this.options = options;
    this.hash = expectedHash;
  }
  getUrl() {
    return new URL(`formats/${this.path}/${this.file}`, import.meta.url);
  }
  toString() {
    return `${this.path}/${this.file}, options: ${JSON.stringify(this.options)}`;
  }
}
