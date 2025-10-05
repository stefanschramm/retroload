import {FormatIdentification, InternalAdapterDefinition} from '../AdapterDefinition.js';
import {OptionContainer, shortpilotOption} from '../../Options.js';
import {OricEncoder, syncByte, syncEndByte} from './OricEncoder.js';
import {hex16, hex8} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for Oric 1 .TAP files
 */
export const OricTapAdapter: InternalAdapterDefinition = {
  label: 'Oric 1 .TAP-File',
  name: 'orictap',
  options: [shortpilotOption],
  identify,
  encode,
};

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.tap$/iu).exec(filename) !== null,
    header: ba.containsDataAt(0, [syncByte]),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  let offset = 0;
  if (ba.getUint8(0) !== syncByte) {
    Logger.info('Warning: File does not start with synchronisation byte(s).');
  }

  while (offset < ba.length()) {
    if (ba.getUint8(offset) !== syncByte) {
      break;
    }
    offset++;
  }
  if (ba.getUint8(offset) === syncEndByte) {
    offset++;
  } else {
    Logger.info('Warning: End of synchronisation marker byte missing.');
  }

  // https://github.com/DJChloe/taptap/blob/master/Tape%20format%20documentation/Oric%20tap%20file%20format.pdf
  const header = ba.slice(offset, 9);
  const type = header.getUint8(2);
  const autorun = header.getUint8(3);
  const endAddress = header.getUint16Be(4);
  const startAddress = header.getUint16Be(6);
  const name = ba.slice(offset + header.length()).extractZeroTerminatedString();

  Logger.debug(`Name: ${name}, Type: ${hex8(type)} (${mapType(type)}), Autorun: ${hex8(autorun)}, End address: ${hex16(endAddress)}, Start address: ${hex16(startAddress)}}`);

  const e = new OricEncoder(
    recorder,
    options.isFlagSet(shortpilotOption),
  );
  e.begin();
  e.recordBytes(ba.slice(offset));
  e.end();
}

function mapType(type: number): string {
  switch (type) {
    case 0x00:
      return 'BASIC';
    case 0x80:
      return 'machine code / memory block';
    default:
      return '?';
  }
}
