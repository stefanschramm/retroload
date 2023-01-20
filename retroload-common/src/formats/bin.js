import {Lc80Adapter} from './generic/lc80.js';
import {Z1013Adapter} from './generic/z1013.js';

export function getName() {
  return 'Generic binary file';
}

export function getInternalName() {
  return 'bin';
}

export function identify(filename, dataView) {
  return {
    filename: filename.match(/^.*\.bin$/i) !== null,
    header: false,
  };
}

export function getAdapters() {
  return [
    Lc80Adapter,
    Z1013Adapter,
  ];
}
