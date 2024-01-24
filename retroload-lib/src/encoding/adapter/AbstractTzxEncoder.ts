import {AbstractEncoder} from './AbstractEncoder.js';
import {Logger} from '../../common/logging/Logger.js';
import {type BufferAccess} from '../../common/BufferAccess.js';
import {InternalError} from '../../common/Exceptions.js';

const fCpu = 3500000;

/**
 * Abstract Encoder class used for ZX Spectrum (.tzx), Amstrad CPC (.cdt) and MSX (.tsx).
 *
 * https://github.com/mamedev/mame/blob/master/src/lib/formats/tzx_cas.cpp
 * https://sinclair.wiki.zxnet.co.uk/wiki/TAP_format
 */
export abstract class AbstractTzxEncoder extends AbstractEncoder {
  public recordStandardSpeedDataBlock(blockDataBa: BufferAccess) {
    this.recordDataBlock(blockDataBa, {
      ...this.getStandardSpeedRecordOptions(),
      pilotPulses: blockDataBa.getUint8(0) < 128 ? 8063 : 3223, // TODO: why?
    });
  }

  public recordDataBlock(blockDataBa: BufferAccess, options: DataRecordOptions) {
    const pilotSamples = this.tzxCyclesToSamples(options.pilotPulseLength);
    for (let i = 0; i < options.pilotPulses; i++) {
      this.recordHalfOscillationSamples(pilotSamples);
    }
    this.recordPulse(options.syncFirstPulseLength);
    this.recordPulse(options.syncSecondPulseLength);
    this.recordPureDataBlock(blockDataBa, options);
  }

  public recordPureDataBlock(blockDataBa: BufferAccess, options: PureDataRecordOptions) {
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

  public recordKansasCityLikeBlock(blockDataBa: BufferAccess, config: KansasCityLikeConfiguration) {
    const bitDuration = [
      config.zeroPulseLength,
      config.onePulseLength,
    ];
    const bitPulses = [
      config.zeroPulsesInZeroBit,
      config.onePulsesInOneBit,
    ];
    for (let i = 0; i < config.pilotPulses; i++) {
      this.recordPulse(config.pilotPulseLength);
    }
    for (let i = 0; i < blockDataBa.length(); i++) {
      for (let j = 0; j < config.startBitCount; j++) {
        this.recordPulses(bitDuration[config.startBitValue], bitPulses[config.startBitValue]);
      }
      const byte = blockDataBa.getUint8(i);
      for (let bit = 0; bit < 8; bit++) {
        const value = (config.msbFirst ? (byte >> (7 - bit)) : (byte >> bit)) & 1;
        this.recordPulses(bitDuration[value], bitPulses[value]);
      }
      for (let j = 0; j < config.stopBitCount; j++) {
        this.recordPulses(bitDuration[config.stopBitValue], bitPulses[config.stopBitValue]);
      }
    }
    this.recordSilenceMs(config.pauseAfterBlockMs);
  }

  public recordPulse(length: number) {
    this.recordHalfOscillationSamples(this.tzxCyclesToSamples(length));
  }

  public recordPulses(length: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.recordHalfOscillationSamples(this.tzxCyclesToSamples(length));
    }
  }

  public override recordBit(_value: number): void {
    throw new InternalError('Call to recordBit not expected for TzxEncoders.');
  }

  public abstract getStandardSpeedRecordOptions(): DataRecordOptions;

  protected abstract getTzxCycleFactor(): number;

  private tzxCyclesToSamples(cycles: number) {
    return Math.floor((0.5 + ((this.recorder.sampleRate / fCpu) * cycles)) * this.getTzxCycleFactor());
  }
}

type PureDataRecordOptions = {
  zeroBitPulseLength: number;
  oneBitPulseLength: number;
  lastByteUsedBits: number;
  pauseLengthMs: number;
};

export type DataRecordOptions = PureDataRecordOptions & {
  pilotPulseLength: number;
  pilotPulses: number;
  syncFirstPulseLength: number;
  syncSecondPulseLength: number;
};

export type KansasCityLikeConfiguration = {
  pauseAfterBlockMs: number;
  pilotPulseLength: number; // tzx cycles
  pilotPulses: number;
  zeroPulseLength: number; // tzx cycles
  onePulseLength: number; // tzx cycles
  zeroPulsesInZeroBit: number;
  onePulsesInOneBit: number;
  startBitCount: number;
  startBitValue: 0 | 1;
  stopBitCount: number;
  stopBitValue: 0 | 1;
  msbFirst: boolean;
};

export const msxKansasCityLikeConfiguration: KansasCityLikeConfiguration = {
  pauseAfterBlockMs: 2000,
  pilotPulseLength: 729,
  pilotPulses: 30720,
  zeroPulseLength: 1458,
  onePulseLength: 729,
  zeroPulsesInZeroBit: 2,
  onePulsesInOneBit: 4,
  startBitCount: 1,
  startBitValue: 0,
  stopBitCount: 2,
  stopBitValue: 0,
  msbFirst: false,
};
