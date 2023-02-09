import {AtariAdapter} from './generic/atari.js';
import {C64Adapter} from './generic/c64.js';
import {CpcAdapter} from './generic/cpc.js';
import {Lc80Adapter} from './generic/lc80.js';
import {Z1013Adapter} from './generic/z1013.js';

export function getName() {
  return 'Generic data';
}

export function getInternalName() {
  return 'generic';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.(bin|raw|txt|asc|atascii)$/i) !== null,
    header: false,
  };
}

export function getAdapters() {
  return [
    AtariAdapter,
    C64Adapter,
    CpcAdapter,
    Lc80Adapter,
    Z1013Adapter,
  ];
}
