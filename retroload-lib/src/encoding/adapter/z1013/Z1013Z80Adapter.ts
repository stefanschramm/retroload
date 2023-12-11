import {Z1013Encoder} from './Z1013Encoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FlagOptionDefinition, type OptionContainer} from '../../Options.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

const z80noHeadersave: FlagOptionDefinition = {
  name: 'noheadersave',
  label: 'No Headersave',
  description: 'Don\'t output headersave header and use normal block numbering for loading with the default monitor loader.',
  common: false,
  type: 'bool',
};

const definition: AdapterDefinition = {
  name: 'Z1013 .Z80-File (Headersave)',
  internalName: 'z80',
  targetName: Z1013Encoder.getTargetName(),
  options: [z80noHeadersave],
  identify,
  encode,
};
export default definition;

const headerLength = 0x20;

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.z80$/i).exec(filename) !== null,
    header: ba.containsDataAt(0x0d, [0xd3, 0xd3, 0xd3]),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const header = ba.slice(0, headerLength);
  const data = ba.slice(headerLength);
  const loadAddress = header.getUint16Le(0x00);
  const endAddress = header.getUint16Le(0x02);
  const startAddress = header.getUint16Le(0x04);
  const expectedDataLength = endAddress - loadAddress + 1;
  const type = header.getUint8(0x0c);
  const name = ba.slice(0x10, 0x10).asAsciiString();
  Logger.log(`Filename: "${name}", Load address: 0x${loadAddress.toString(16)}, End address: 0x${endAddress.toString(16)}, Start address: 0x${startAddress.toString(16)}, Type: ${type.toString(16)}`);
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
