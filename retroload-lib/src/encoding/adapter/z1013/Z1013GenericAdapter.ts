import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {Z1013Encoder} from './Z1013Encoder.js';

/**
 * Adapter for generic data for Z 1013
 */
export const Z1013GenericAdapter: InternalAdapterDefinition = {
  label: 'Z 1013 (Generic data)',
  name: 'z1013generic',
  options: [],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new Z1013Encoder(recorder);
  e.begin();
  e.recordData(ba);
  e.end();
}
