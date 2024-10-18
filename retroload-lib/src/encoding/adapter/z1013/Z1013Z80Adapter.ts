import {Z1013Encoder} from './Z1013Encoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FlagOptionDefinition, type OptionContainer} from '../../Options.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {hex16, hex8} from '../../../common/Utils.js';

const z80noHeadersave: FlagOptionDefinition = {
  name: 'noheadersave',
  label: 'No Headersave',
  description: 'Don\'t output headersave header and use normal block numbering for loading with the default monitor loader.',
  common: false,
  type: 'bool',
};

/**
 * Adapter for Z 1013 .Z80 files (Headersave)
 */
const definition: InternalAdapterDefinition = {
  label: 'Z 1013 .Z80-File (Headersave)',
  name: 'z80',
  options: [z80noHeadersave],
  identify,
  encode,
};
export default definition;

const headerLength = 0x20;

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.z80$/i).exec(filename) !== null,
    header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const header = ba.slice(0, headerLength);
  const data = ba.slice(headerLength);
  const loadAddress = header.getUint16Le(0x00);
  const endAddress = header.getUint16Le(0x02);
  const startAddress = header.getUint16Le(0x04);
  const expectedDataLength = endAddress - loadAddress + 1;
  const type = header.getUint8(0x0c);
  const name = ba.slice(0x10, 0x10).asAsciiString();
  Logger.log(`Filename: "${name}", Load address: ${hex16(loadAddress)}, End address: ${hex16(endAddress)}, Start address: 0x${hex16(startAddress)}, Type: ${hex8(type)}`);
  if (expectedDataLength > data.length()) {
    Logger.error(`Warning: By headersave header ${expectedDataLength} data bytes are expected but Z80 file only contains ${data.length()} data bytes.`);
  }
  const e = new Z1013Encoder(recorder);
  e.begin();
  if (options.isFlagSet(z80noHeadersave)) {
    e.recordData(data);
  } else {
    e.recordBlock(0x00e0, header);
    e.recordFirstIntro();
    e.recordHeadersaveData(data, loadAddress);
  }
  e.end();
}
