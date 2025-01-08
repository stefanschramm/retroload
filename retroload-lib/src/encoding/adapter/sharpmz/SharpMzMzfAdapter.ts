import {FormatIdentification, InternalAdapterDefinition} from '../AdapterDefinition.js';
import {OptionContainer, shortpilotOption} from '../../Options.js';
import {hex16, hex8} from '../../../common/Utils.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';
import {SharpMzEncoder} from './SharpMzEncoder.js';
import {sharpmznorepeatOption} from './SharpMzDefinitions.js';

/**
 * Adapter for Sharp MZ .MZF files
 *
 * https://original.sharpmz.org/mz-700/tapeproc.htm
 * https://original.sharpmz.org/mz-700/coremain.htm
 */
export const SharpMzMzfAdapter: InternalAdapterDefinition = {
  label: 'Sharp MZ .MZF-File',
  name: 'sharpmzmzf',
  options: [
    sharpmznorepeatOption,
    shortpilotOption,
  ],
  identify,
  encode,
};

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.mzf$/iu).exec(filename) !== null,
    header: undefined,
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const header = ba.slice(0, 128);
  const data = ba.slice(128);
  const fileType = header.getUint8(0);
  const fileSize = header.getUint16Le(0x12);
  // TODO: File name seems to be delimited by 0x0d and uses "SHARPSCII". We would need to convert it to display it.
  // const fileName = header.slice(1, 14).asAsciiString();
  const loadAddress = header.getUint16Le(0x14);
  const startAddress = header.getUint16Le(0x16);
  // const comment = header.slice(0x18, 104);
  Logger.info(`File type: ${hex8(fileType)} File size: ${hex16(fileSize)} Load address: ${hex16(loadAddress)} Start address: ${hex16(startAddress)}`);
  // Logger.info(fileName);
  if (fileSize !== data.length()) {
    Logger.error(`Warning: Actual length of data in MZF file (${data.length()} bytes) is not equal to length specified within header (${fileSize} bytes).`);
  }

  const doRepeat = !options.isFlagSet(sharpmznorepeatOption);
  const shortpilot = options.isFlagSet(shortpilotOption);

  const e = new SharpMzEncoder(recorder);

  e.begin();
  e.recordHeader(header, doRepeat, shortpilot);
  e.recordData(data, doRepeat);
  e.end();
}
