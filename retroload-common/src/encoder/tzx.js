import {BaseEncoder} from './base.js';
import {InternalError} from '../exception.js';

const fCpu = 3500000;

const standardSpeedRecordOptions = {
  // ZX Spectrum defaults (for non-turbo-speed-data blocks)
  // TODO: Put into encoder? - Required by TzxProcessor and TapAdapter!
  pauseLengthMs: 1000,
  pilotPulseLength: 2168,
  syncFirstPulseLength: 667,
  syncSecondPulseLength: 735,
  zeroBitPulseLength: 855,
  oneBitPulseLength: 1710,
  lastByteUsedBits: 8,
};

/**
 * Abstract Encoder class for .tzx files. Used for ZX Spectrum and Amstrad CPC (.cdt).
 *
 * Work in progress.
 *
 * Format description:
 * http://k1.spdns.de/Develop/Projects/zasm/Info/TZX%20format.html
 * https://www.cpcwiki.eu/index.php/Format:CDT_tape_image_file_format
 * https://github.com/mamedev/mame/blob/master/src/lib/formats/tzx_cas.cpp
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
export class TzxEncoder extends BaseEncoder {
  recordStandardSpeedDataBlock(blockDataDv) {
    this.recordDataBlock(blockDataDv, {
      ...standardSpeedRecordOptions,
      pilotPulses: blockDataDv.getUint8(0) < 128 ? 8063 : 3223,
    });
  }

  recordDataBlock(blockDataDv, options) {
    const pilotSamples = this.tzxCyclesToSamples(options.pilotPulseLength);
    for (let i = 0; i < options.pilotPulses; i++) {
      this.recordHalfOscillationSamples(pilotSamples);
    }
    this.recordPulse(options.syncFirstPulseLength);
    this.recordPulse(options.syncSecondPulseLength);
    this.recordPureDataBlock(blockDataDv, options);
  }

  recordPureDataBlock(blockDataDv, options) {
    const zeroBitSamples = this.tzxCyclesToSamples(options.zeroBitPulseLength);
    const oneBitSamples = this.tzxCyclesToSamples(options.oneBitPulseLength);

    for (let i = 0; i < blockDataDv.byteLength; i++) {
      let byte = blockDataDv.getUint8(i);
      let bits = (i === blockDataDv.byteLength - 1) ? options.lastByteUsedBits : 8;
      while (bits > 0) {
        const samples = ((byte & 0x80) === 0) ? zeroBitSamples : oneBitSamples;
        this.recordHalfOscillationSamples(samples);
        this.recordHalfOscillationSamples(samples);
        byte <<= 1;
        bits--;
      }
    }

    this.recordSilenceMs(options.pauseLengthMs);
  }

  recordPulse(length) {
    this.recordHalfOscillationSamples(this.tzxCyclesToSamples(length));
  }

  recordBit(value) {
    if (value) {
      this.recordHalfOscillationSamples(this.parameters.oneBitSamples);
    } else {
      this.recordHalfOscillationSamples(this.parameters.zeroBitSamples);
    }
  }

  tzxCyclesToSamples(cycles) {
    return Math.floor((0.5 + ((this.recorder.sampleRate / fCpu) * cycles)) * this.getTzxCycleFactor());
  }

  getTzxCycleFactor() {
    throw new InternalError('getTzxCycleFactor() not implemented!');
  }
}
