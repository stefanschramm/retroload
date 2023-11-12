import {type WriterDefinition} from '../ConverterManager.js';
import Apple2GenericWriter from './apple2/Apple2GenericWriter.js';
import KcTapWriter from './kc/KcTapWriter.js';
import Lc80GenericWriter from './lc80/Lc80GenericWriter.js';
import Z1013GenericWriter from './z1013/Z1013GenericWriter.js';

const writers: WriterDefinition[] = [
  Apple2GenericWriter,
  KcTapWriter,
  Lc80GenericWriter,
  Z1013GenericWriter,
];
export default writers;
