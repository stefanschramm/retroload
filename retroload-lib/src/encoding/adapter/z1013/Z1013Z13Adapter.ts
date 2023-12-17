import Z1013GenericAdapter from './Z1013GenericAdapter.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for Z 1013 .Z13 files (raw data)
 */
const definition: AdapterDefinition = {
  ...Z1013GenericAdapter,
  name: 'Z 1013 .Z13-File',
  internalName: 'z13',
  identify,
};
export default definition;

function identify(filename: string, _ba: BufferAccess) {
  return {
    filename: (/^.*\.z13$/i).exec(filename) !== null,
    header: undefined, // no specific header
  };
}
