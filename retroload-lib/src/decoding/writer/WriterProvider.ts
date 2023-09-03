import {type WriterDefinition} from '../ConverterManager.js';
import KcTapWriter from './kc/KcTapWriter.js';

const writers: WriterDefinition[] = [
  KcTapWriter,
];
export default writers;
