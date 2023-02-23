import {AtariGenericAdapter} from './generic/atari.js';
import {C64GenericAdapter} from './generic/c64.js';
import {CpcGenericAdapter} from './generic/cpc.js';
import {Lc80GenericAdapter} from './generic/lc80.js';
import {TaGenericAdapter} from './generic/ta.js';
import {Z1013GenericAdapter} from './generic/z1013.js';

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
    AtariGenericAdapter,
    C64GenericAdapter,
    CpcGenericAdapter,
    Lc80GenericAdapter,
    TaGenericAdapter,
    Z1013GenericAdapter,
  ];
}
