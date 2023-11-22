import {type OptionContainer} from '../../Options.js';
import {type BufferAccess} from '../../../common/BufferAccess.js';
import {type RecorderInterface} from '../../recorder/RecorderInterface.js';
import {TiEncoder} from './TiEncoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {type AdapterDefinition} from '../AdapterDefinition.js';

/**
 * https://www.ninerpedia.org/wiki/TIFILES_format
 */
const definition: AdapterDefinition = {
  name: 'TI-99/4A .TIFILE-File',
  internalName: 'tifile',
  targetName: TiEncoder.getTargetName(),
  options: [],
  identify,
  encode,
};
export default definition;

const fileHeader = '\x07TIFILES';
const sectorSize = 0x100;
const blockSize = 64;

function identify(filename: string, ba: BufferAccess) {
  return {
    filename: (/^.*\.(tifile|tfi)/i).exec(filename) !== null,
    header: ba.containsDataAt(0, fileHeader),
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer) {
  const sectorCount = ba.getUint16Be(0x08);
  const flags = ba.getUint8(0x0a);
  const recordsPerSector = ba.getUint8(0x0b);
  const eofOffest = ba.getUint8(0x0c);
  const recordLength = ba.getUint8(0x0d);
  const level3Records = ba.getUint16Le(0x0e);
  const filename = ba.slice(0x10, 8).asAsciiString();
  Logger.debug(`TIFILE header data: Sectors: ${sectorCount} Flags: ${flags} Records per sector: ${recordsPerSector} EOF offset: ${eofOffest} Record length: ${recordLength} Level-3 Records: ${level3Records} Filename: ${filename}`);
  const dataBa = ba.slice(0x80);
  const sectors = dataBa.chunks(sectorSize);
  if (sectors.length !== sectorCount) {
    Logger.info(`Remaining size of TIFILE does not match sector count as specified in the header (${sectorCount}). Remaining data is omitted.`);
  }
  const e = new TiEncoder(recorder);
  e.begin();
  const fullSectorCount = eofOffest === 0 ? sectorCount : sectorCount - 1;
  const blocksInFullSectors = fullSectorCount * (sectorSize / blockSize);
  const additionalBlocksInLastSector = Math.ceil(eofOffest / blockSize);
  e.recordHeader(blocksInFullSectors + additionalBlocksInLastSector);
  for (let i = 0; i < sectorCount; i++) {
    const sector = sectors[i];
    const lastSector = i === sectors.length - 1;
    const blocks = lastSector ? sector.slice(0, eofOffest).chunksPadded(blockSize) : sector.chunks(blockSize);
    for (const block of blocks) {
      e.recordBlock(block);
    }
  }
  e.end();
}
