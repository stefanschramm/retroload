import {type BufferAccess} from '../../common/BufferAccess.js';
import {Z1013Encoder} from '../encoder/Z1013Encoder.js';
import {type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';

const definition: AdapterDefinition = {
  name: 'Z1013 (Generic data)',
  internalName: 'z1013generic',
  targetName: Z1013Encoder.getTargetName(),
  options: [],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const e = new Z1013Encoder(recorder);
  e.begin();
  e.recordData(ba);
  e.end();
}
