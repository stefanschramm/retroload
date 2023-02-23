import {Z1013GenericAdapter} from './generic/z1013.js';

export function getName() {
  return 'Z1013 .Z13-File';
}

export function getInternalName() {
  return 'z1013z13';
}

export function identify(filename, ba) {
  return {
    filename: filename.match(/^.*\.z13$/i) !== null,
    header: undefined, // no specific header
  };
}

export function getAdapters() {
  return [Z1013GenericAdapter];
}
