import Z1013GenericAdapter from './Z1013GenericAdapter.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for Z 1013 .Z13 files (raw data)
 */
const definition: InternalAdapterDefinition = {
  ...Z1013GenericAdapter,
  label: 'Z 1013 .Z13-File',
  name: 'z13',
  identify,
};
export default definition;

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.z13$/i).exec(filename) !== null,
    header: undefined, // no specific header
  };
}
