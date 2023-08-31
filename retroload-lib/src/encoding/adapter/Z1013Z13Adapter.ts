import Z1013GenericAdapter from './Z1013GenericAdapter.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const definition: AdapterDefinition = {

  ...Z1013GenericAdapter,

  name: 'Z1013 .Z13-File',

  internalName: 'z13',

  identify(filename: string, _ba: BufferAccess) {
    return {
      filename: (/^.*\.z13$/i).exec(filename) !== null,
      header: undefined, // no specific header
    };
  },
};
export default definition;
