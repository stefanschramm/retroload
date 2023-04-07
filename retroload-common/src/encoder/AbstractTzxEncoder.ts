import {AbstractEncoder} from './AbstractEncoder.js';
import {Logger} from '../Logger.js';
import {type BufferAccess} from '../BufferAccess.js';

const fCpu = 3500000;

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
export abstract class AbstractTzxEncoder extends AbstractEncoder {
  recordStandardSpeedDataBlock(blockDataBa: BufferAccess) {
    this.recordDataBlock(blockDataBa, {
      ...this.getStandardSpeedRecordOptions(),
      pilotPulses: blockDataBa.getUint8(0) < 128 ? 8063 : 3223, // TODO: why?
    });
  }

  recordDataBlock(blockDataBa: BufferAccess, options: SpeedRecordOptions) {
    const pilotSamples = this.tzxCyclesToSamples(options.pilotPulseLength);
    for (let i = 0; i < options.pilotPulses; i++) {
      this.recordHalfOscillationSamples(pilotSamples);
    }
    this.recordPulse(options.syncFirstPulseLength);
    this.recordPulse(options.syncSecondPulseLength);
    this.recordPureDataBlock(blockDataBa, options);
  }

  recordPureDataBlock(blockDataBa: BufferAccess, options: SpeedRecordOptions) {
    const zeroBitSamples = this.tzxCyclesToSamples(options.zeroBitPulseLength);
    const oneBitSamples = this.tzxCyclesToSamples(options.oneBitPulseLength);

    Logger.debug('TzxEncoder - recordPureDataBlock');
    Logger.debug(blockDataBa.asHexDump());

    for (let i = 0; i < blockDataBa.length(); i++) {
      let byte = blockDataBa.getUint8(i);
      let bits = (i === blockDataBa.length() - 1) ? options.lastByteUsedBits : 8;
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

  tzxCyclesToSamples(cycles) {
    return Math.floor((0.5 + ((this.recorder.sampleRate / fCpu) * cycles)) * this.getTzxCycleFactor());
  }

  abstract getTzxCycleFactor(): number;

  abstract getStandardSpeedRecordOptions(): SpeedRecordOptions;
}

export type SpeedRecordOptions = Record<string, number>;
