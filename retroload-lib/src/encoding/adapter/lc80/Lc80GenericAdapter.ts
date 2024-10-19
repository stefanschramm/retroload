import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type OptionContainer, loadOption, nameOption} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {Lc80Encoder} from './Lc80Encoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {hex16} from '../../../common/Utils.js';

/**
 * Adapter for generic data for LC 80
 */
const definition: InternalAdapterDefinition = {
  label: 'LC80 (Generic data)',
  name: 'lc80generic',
  options: [
    nameOption,
    loadOption,
  ],
  identify,
  encode,
};
export default definition;

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const fileNumber = parseInt(options.getArgument(nameOption), 16);
  if (isNaN(fileNumber) || fileNumber < 0 || fileNumber > 0xffff) {
    throw new InvalidArgumentError('name', 'Option name is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 0001');
  }

  const loadAddress = options.getArgument(loadOption);
  if (loadAddress === undefined) {
    throw new InvalidArgumentError('load', 'Option load is expected to be a 16-bit number in hexadecimal representation (0000 to ffff). Example: 2000');
  }

  const e = new Lc80Encoder(recorder);
  e.begin();
  const endAddress = loadAddress + ba.length();
  Logger.debug(`Writing header - File number/name: ${hex16(fileNumber)}, Load address: ${hex16(loadAddress)}, End address: ${hex16(endAddress)}`);
  e.recordHeader(fileNumber, loadAddress, endAddress);
  e.recordData(ba);
  e.end();
}
