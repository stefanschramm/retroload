import {ZxSpectrumTzxEncoder} from '../encoder/ZxSpectrumTzxEncoder.js';
import {BufferAccess} from '../../common/BufferAccess.js';
import {nameOption, type OptionContainer} from '../Options.js';
import {type RecorderInterface} from '../recorder/RecorderInterface.js';
import {unidentifiable, type AdapterDefinition} from './AdapterDefinition.js';
import {calculateChecksum8Xor} from '../../common/Utils.js';

// const typeProgram = 0;
// const typeNumberArray = 1;
// const typeCharArray = 2;
const typeBinary = 3;

/**
 * https://faqwiki.zxnet.co.uk/wiki/Spectrum_tape_interface
 * https://faqwiki.zxnet.co.uk/wiki/TAP_format
 */
const definition: AdapterDefinition = {

  name: 'ZX Spectrum (Generic data)',

  internalName: 'zxspectrumgeneric',

  targetName: ZxSpectrumTzxEncoder.getTargetName(),

  options: [
    nameOption,
  ],

  identify(_filename: string, _ba: BufferAccess) {
    return unidentifiable;
  },

  encode(recorder: RecorderInterface, ba: BufferAccess, options: OptionContainer) {
    const name = options.getArgument(nameOption);
    const type = typeBinary; // TODO: option

    const e = new ZxSpectrumTzxEncoder(recorder);
    e.begin();

    const headerBlockBa = BufferAccess.create(19);
    headerBlockBa.writeUint8(0x00); // marker byte
    headerBlockBa.writeUint8(type);
    headerBlockBa.writeAsciiString(name, 10, 0x20);
    headerBlockBa.writeUint16Le(ba.length());
    headerBlockBa.writeUint16Le(0x8000); // param1
    headerBlockBa.writeUint16Le(0x8000); // param2
    headerBlockBa.writeUint8(calculateChecksum8Xor(headerBlockBa.slice(0, 18)));

    e.recordStandardSpeedDataBlock(headerBlockBa);

    const dataBlockBa = BufferAccess.create(ba.length() + 2);
    dataBlockBa.writeUint8(0xff); // marker byte
    dataBlockBa.writeBa(ba);
    dataBlockBa.writeUint8(calculateChecksum8Xor(dataBlockBa));

    e.recordStandardSpeedDataBlock(dataBlockBa);

    e.end();
  },
};
export default definition;
