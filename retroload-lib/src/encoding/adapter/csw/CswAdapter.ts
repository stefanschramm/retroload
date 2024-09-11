import {inflate} from 'pako';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {Logger} from '../../../common/logging/Logger.js';
import {hex8} from '../../../common/Utils.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';
import {Oscillator} from '../Oscillator.js';

const definition: AdapterDefinition = {
  name: 'CSW .CSW-File',
  internalName: 'csw',
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = 'Compressed Square Wave\x1a';

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.cdt/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const cswMajorVersion = ba.getUint8(0x17);
  const cswMinorVersion = ba.getUint8(0x18);
  Logger.debug(`CSW Version: ${cswMajorVersion}.${cswMinorVersion}`);

  let sampleRate: number;
  let pulseCount: number | undefined;
  let compressionType: number;
  let flags: number;
  let initialPolarity: boolean;
  let cswData: BufferAccess;
  if (cswMajorVersion >= 2) {
    // Version > 2.0
    sampleRate = ba.getUint32Le(0x19);
    pulseCount = ba.getUint32Le(0x1d);
    compressionType = ba.getUint8(0x21);
    flags = ba.getUint8(0x22);
    initialPolarity = (flags & 1) !== 0;
    const headerExtensionLength = ba.getUint8(0x23);
    const encodingApplicationDescription = ba.slice(0x24, 16).asAsciiString();
    Logger.debug(`CSW Encoding application description: ${encodingApplicationDescription}`);
    Logger.debug(`CSW Pulse count: ${pulseCount}`);
    // header extension data is ignored
    cswData = ba.slice(0x34 + headerExtensionLength);
  } else {
    // Version < 2.0
    sampleRate = ba.getUint16Le(0x19);
    compressionType = ba.getUint8(0x1b);
    flags = ba.getUint8(0x1c);
    initialPolarity = (flags & 1) !== 0;
    cswData = ba.slice(0x20);
  }

  Logger.debug(`CSW Sample rate: ${sampleRate}`);
  Logger.debug(`CSW Compression type: ${hex8(compressionType)}`);
  Logger.debug(`CSW Flags: ${flags} (Initial polarity: ${initialPolarity})`);

  const rleCswData = compressionType === 0x02
    ? BufferAccess.createFromUint8Array(inflate(cswData.asUint8Array()))
    : cswData;

  const oscillator = new Oscillator(recorder, initialPolarity);

  let i = 0;
  let recordedPulses = 0;
  while (i < rleCswData.length()) {
    let pulseLength = rleCswData.getUint8(i);
    if (pulseLength === 0) {
      i++;
      pulseLength = rleCswData.getUint32Le(i);
      i += 3;
    }
    oscillator.recordHalfOscillation(sampleRate / pulseLength);
    recordedPulses++;
    i++;
  }
  if (pulseCount !== undefined && recordedPulses !== pulseCount) {
    Logger.error(`File header announced ${pulseCount} pulses, but only ${recordedPulses} were recorded!?`);
  }
}
