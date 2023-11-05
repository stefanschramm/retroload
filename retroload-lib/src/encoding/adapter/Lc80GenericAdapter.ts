import {Lc80Encoder} from '../encoder/Lc80Encoder.js';
import {loadOption, nameOption, type OptionContainer} from '../Options.js';
import {InvalidArgumentError} from '../../common/Exceptions.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type FormatIdentification} from './AdapterDefinition.js';
import {type AdapterDefinition} from './AdapterDefinition.js';
import {hex16} from '../../common/Utils.js';
import {Logger} from '../../common/logging/Logger.js';

const definition: AdapterDefinition = {
  name: 'LC80 (Generic data)',
  internalName: 'lc80generic',
  targetName: Lc80Encoder.getTargetName(),
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

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
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
