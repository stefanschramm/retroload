import {MsxEncoder} from '../encoder/MsxEncoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {shortpilotOption, type OptionContainer} from '../Options.js';
import {type AdapterDefinition} from './AdapterDefinition.js';
import {msxfastOption} from './options/MsxOptions.js';

const definition: AdapterDefinition = {
  name: 'MSX .CAS-File',
  internalName: 'msxcas',
  targetName: MsxEncoder.getTargetName(),
  options: [
    shortpilotOption,
    msxfastOption,
  ],
  identify,
  encode,
};
export default definition;

const blockHeader = [0x1f, 0xa6, 0xde, 0xba, 0xcc, 0x13, 0x7d, 0x74];

const typeHeaderLength = 10;
const headerTypes = {
  binary: Array(typeHeaderLength).fill(0xd0),
  basic: Array(typeHeaderLength).fill(0xd3),
  ascii: Array(typeHeaderLength).fill(0xea),
};

function determineType(dataBa: BufferAccess, offset: number) {
  for (const [type, header] of Object.entries(headerTypes)) {
    if (dataBa.containsDataAt(offset, header)) {
      return type;
    }
  }

  return undefined; // unknown
}

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.cas$/i).exec(filename) !== null,
    header: ba.containsDataAt(0, blockHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
  const e = new MsxEncoder(
    recorder,
    options.isFlagSet(shortpilotOption),
    options.isFlagSet(msxfastOption),
  );
  e.begin();
  for (let i = 0; i < ba.length(); i++) {
    if (i % 8 === 0 && ba.containsDataAt(i, blockHeader)) {
      const blockHeaderPosition = i;
      i += blockHeader.length;
      const type = determineType(ba, i);
      const long = (['binary', 'basic', 'ascii'] as Array<string | undefined>).includes(type);
      Logger.debug(`MsxCasAdapter - block header at\t0x' ${(blockHeaderPosition).toString(16).padStart(4, '0')}\t type: ${type!}`);
      e.recordHeader(long);
    }
    e.recordByte(ba.getUint8(i));
  }
  e.end();
}
