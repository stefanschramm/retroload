import {type WriterDefinition} from '../ConverterManager.js';
import KcTapWriter from './kc/KcTapWriter.js';
import Lc80GenericWriter from './lc80/Lc80GenericWriter.js';

const writers: WriterDefinition[] = [
  KcTapWriter,
  Lc80GenericWriter,
];
export default writers;
