import {type FormatIdentification, type InternalAdapterDefinition, unidentifiable} from '../AdapterDefinition.js';
import {Ibm5150Encoder, blockSize} from './Ibm5150Encoder.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {type OptionContainer} from '../../Options.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';

/**
 * Adapter for IBM PC 5150 Cassette BASIC
 */
export const Ibm5150GenericAdapter: InternalAdapterDefinition = {
  label: 'IBM 5150 BASIC (Generic data)',
  name: 'ibm5150generic',
  options: [],
  identify,
  encode,
};

function identify(_filename: string, _ba: BufferAccess): FormatIdentification {
  return unidentifiable;
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const e = new Ibm5150Encoder(recorder);

  e.begin();

  // BASIC header
  const header = BufferAccess.create(256);
  header.writeUint8(0xa5);
  header.writeAsciiString('test    ');
  header.writeUint8(0x80); // Tokenised BASIC
  header.writeUint16Le(ba.length());
  header.writeUint16Le(0x0060);
  header.writeUint16Le(0x081e);
  header.writeUint8(0x00);
  for (let i = 0; i < 256 - 17; i++) {
    // Unclear why PC is padding it with 0x01 instead of 0x00...
    header.writeUint8(0x01);
  }

  e.recordSyncSequence();
  e.recordBlock(header);
  e.recordEndOfDataSequence();

  e.recordGap();


  // Data
  e.recordSyncSequence();
  for (const chunk of ba.chunksPadded(blockSize)) {
    e.recordBlock(chunk);
  }
  e.recordEndOfDataSequence();

  e.end();
}
