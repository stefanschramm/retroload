import {type InternalDecoderDefinition} from '../DecoderManager.js';
import Apple2GenericDecoder from './apple2/Apple2GenericDecoder.js';
import KcTapDecoder from './kc/KcTapDecoder.js';
import Lc80GenericDecoder from './lc80/Lc80GenericDecoder.js';
import PcGenericDecoder from './pc/PcGenericDecoder.js';
import Z1013GenericDecoder from './z1013/Z1013GenericDecoder.js';

const decoders: InternalDecoderDefinition[] = [
  Apple2GenericDecoder,
  KcTapDecoder,
  Lc80GenericDecoder,
  PcGenericDecoder,
  Z1013GenericDecoder,
];
export default decoders;
