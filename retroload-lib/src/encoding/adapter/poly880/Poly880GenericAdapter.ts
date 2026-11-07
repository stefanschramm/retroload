import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {Poly880Encoder} from './Poly880Encoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for raw data for the Polycomputer 880. The recording does not contain
 * a load address or data length; these must be set on the computer.
 */
export const Poly880GenericAdapter: InternalAdapterDefinition = {
  label: 'Polycomputer 880 (Generic data)',
  name: 'poly880generic',
  options: [],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const encoder = new Poly880Encoder(recorder);
  encoder.begin();
  encoder.recordData(ba);
  encoder.end();
}
