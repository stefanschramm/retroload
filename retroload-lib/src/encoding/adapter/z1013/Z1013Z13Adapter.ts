import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Z1013GenericAdapter} from './Z1013GenericAdapter.js';

/**
 * Adapter for Z 1013 .Z13 files (raw data)
 */
export const Z1013Z13Adapter: InternalAdapterDefinition = {
  ...Z1013GenericAdapter,
  label: 'Z 1013 .Z13-File',
  name: 'z13',
  identify,
};

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.z13$/iu).exec(filename) !== null,
    header: undefined, // no specific header
  };
}
