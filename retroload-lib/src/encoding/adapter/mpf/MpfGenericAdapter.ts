import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {type OptionContainer, loadOption, nameOption, parse16BitIntegerOption, shortpilotOption} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {InvalidArgumentError} from '../../../common/Exceptions.js';
import {Logger} from '../../../common/logging/Logger.js';
import {MpfEncoder} from './MpfEncoder.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {hex16} from '../../../common/Utils.js';

/**
 * Adapter for generic data for Microprofessor MPF-1
 */
export const MpfGenericAdapter: InternalAdapterDefinition = {
  label: 'Microprofessor MPF-1 (Generic data)',
  name: 'mpfgeneric',
  options: [
    nameOption,
    loadOption,
    shortpilotOption,
  ],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const fileNumberString = options.getArgument(nameOption);
  const fileNumber = parse16BitIntegerOption(fileNumberString, 'name');
  if (fileNumber === undefined) {
    throw new InvalidArgumentError(nameOption.name, `Option ${nameOption.name} can not be undefined.`);
  }

  const loadAddress = options.getArgument(loadOption);
  if (loadAddress === undefined) {
    throw new InvalidArgumentError(loadOption.name, `Option ${nameOption.name} can not be undefined.`);
  }

  const e = new MpfEncoder(recorder, options.isFlagSet(shortpilotOption));
  e.begin();
  const endAddress = loadAddress + ba.length() - 1;
  Logger.debug(`Writing header - File number/name: ${hex16(fileNumber)}, Load address: ${hex16(loadAddress)}, End address: ${hex16(endAddress)}`);
  e.recordHeader(fileNumber, loadAddress, endAddress);
  e.recordData(ba);
  e.end();
}
