import {type BufferAccess} from '../../../common/BufferAccess.js';
import {Z1013Encoder} from './Z1013Encoder.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from '../AdapterDefinition.js';
import {type InternalAdapterDefinition} from '../AdapterDefinition.js';

/**
 * Adapter for generic data for Z 1013
 */
const definition: InternalAdapterDefinition = {
  name: 'Z 1013 (Generic data)',
  internalName: 'z1013generic',
  options: [],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new Z1013Encoder(recorder);
  e.begin();
  e.recordData(ba);
  e.end();
}
