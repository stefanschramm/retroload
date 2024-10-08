import {C64Encoder} from './C64Encoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type FormatIdentification, type AdapterDefinition} from '../AdapterDefinition.js';
import {c64machineOption} from './C64Options.js';
import {hex8} from '../../../common/Utils.js';

/**
 * Adapter for C64 .TAP files
 *
 * https://www.c64-wiki.com/wiki/TAP
 */
const definition: AdapterDefinition = {
  name: 'C64 .TAP-File',
  internalName: 'c64tap',
  options: [c64machineOption],
  identify,
  encode,
};
export default definition;

export const c64TapfileHeader = 'C64-TAPE-RAW';
const defaultLongPulse = 2048;

function identify(filename: string, ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.tap$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, c64TapfileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer): void {
  const header = ba.slice(0, 0x14);
  const version = header.getUint8(0x0c);
  const dataLength = header.getUint32Le(0x10);

  Logger.debug(`C64TapAdapter - version: ${hex8(version)}, dataLength: ${dataLength}`);

  const data = ba.slice(header.length(), dataLength);
  const e = new C64Encoder(
    recorder,
    undefined,
    options.getArgument(c64machineOption),
  );
  e.begin();
  for (let i = 0; i < data.length(); i += 1) {
    const value = data.getUint8(i);
    let pulseLength: number;
    if (value === 0) {
      // Long pulse
      if (version === 0) {
        pulseLength = defaultLongPulse;
      } else {
        pulseLength = data.getUint8(i + 1) + data.getUint8(i + 2) * 256 + data.getUint8(i + 3) * 65536;
        i += 3;
      }
    } else {
      // Usual pulse
      pulseLength = 8 * value;
    }
    e.recordPulse(pulseLength);
  }
  e.end();
}
