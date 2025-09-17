import {FormatIdentification, InternalAdapterDefinition} from '../AdapterDefinition.js';
import {BufferAccess} from '../../../common/BufferAccess.js';
import {LaserVzEncoder} from './LaserVzEncoder.js';
import {Logger} from '../../../common/logging/Logger.js';
import {OptionContainer} from '../../Options.js';
import {RecorderInterface} from '../../recorder/RecorderInterface.js';

// https://github.com/z88dk/z88dk/blob/master/src/appmake/vz.c
// https://www.ele.uva.es/~jesus/laser200.pdf

export const LaserVzAdapter: InternalAdapterDefinition = {
  label: 'Laser VZ 200 .VZ-File',
  name: 'vz',
  options: [],
  identify,
  encode,
};

function identify(filename: string, _ba: BufferAccess): FormatIdentification {
  return {
    filename: (/^.*\.vz$/iu).exec(filename) !== null,
    header: undefined,
  };
}

function encode(recorder: RecorderInterface, ba: BufferAccess, _options: OptionContainer): void {
  const magic = ba.slice(0, 4);
  const filename = ba.slice(4, 17);
  Logger.debug(magic.asHexDump());
  Logger.debug(filename.asHexDump());

  const e = new LaserVzEncoder(recorder);
  e.begin();
  e.end();
}
