import {C64Encoder} from './C64Encoder.js';
import {shortpilotOption, type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type InternalAdapterDefinition} from '../AdapterDefinition.js';
import {c64machineOption} from './C64Options.js';
import {c64TapfileHeader} from './C64TapAdapter.js';

/**
 * Adapter for C64 .T64 files
 *
 * http://unusedino.de/ec64/technical/formats/t64.html
 */
const definition: InternalAdapterDefinition = {
  name: 'C64 .T64-File',
  internalName: 't64',
  options: [shortpilotOption, c64machineOption],
  identify,
  encode,
};
export default definition;

// Usually 'C64 tape image file' or 'C64S tape file' but might be different
const fileHeader = 'C64';

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.t64$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader) && !ba.containsDataAt(0, c64TapfileHeader) && !ba.containsDataAt(0, 'C64 CARTRIDGE'),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const e = new C64Encoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.getArgument(c64machineOption),
  );

  const header = ba.slice(0, 0x40);
  const entries = header.getUint16Le(0x24);

  e.begin();

  for (let entry = 0; entry < entries; entry++) {
    const entryLength = 0x20;
    const entryOffset = header.length() + (entry * entryLength);
    const entryInfo = ba.slice(entryOffset, entryLength);
    const type = entryInfo.getUint8(0x00); // 0 = free, 1 = tape file, 2 = memory snapshot
    if (type === 0) {
      continue; // not interesting
    }
    const loadAddress = entryInfo.getUint16Le(0x02);
    const endAddress = entryInfo.getUint16Le(0x04);
    const dataLength = endAddress - loadAddress;
    const containerOffset = entryInfo.getUint32Le(0x08);
    const filename = ba.slice(entryOffset + 0x10, 0x10);
    const entryData = ba.slice(containerOffset, dataLength);
    e.recordPrg(loadAddress, filename.asAsciiString(), entryData);
  }

  e.end();
}
